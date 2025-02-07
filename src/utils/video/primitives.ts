import {writeFileSync} from 'fs';
import {dirname, join} from 'path';

import ffmpeg, {FfmpegCommand} from 'fluent-ffmpeg';

import {log, logError} from '../logging';

type PrepareOoutputFileNameOptions = {
    outputFileName?: string;
    suffix?: string;
    extention?: string;
};

const ENABLE_STDERR = Boolean(process.env.ENABLE_STDERR);
const ENABLE_PROGRESS = Boolean(process.env.ENABLE_PROGRESS);
const ENABLE_START = Boolean(process.env.ENABLE_START);

const ffmpegCommon = (
    ffmpegCommand: FfmpegCommand,
    resolve: (outputPash: string) => void,
    reject: (reason?: string) => void,
    outputPath: string,
    reason?: string,
) => {
    if (ENABLE_STDERR) {
        ffmpegCommand.on('stderr', (stderrLine) => {
            logError(2, 'FFmpeg stderr:', stderrLine);
        });
    }

    if (ENABLE_PROGRESS) {
        ffmpegCommand.on('progress', (progress) => {
            log(`Processing: ${progress}% done`);
        });
    }

    if (ENABLE_START) {
        ffmpegCommand.on('start', (commandLine) => {
            log('FFmpeg process started:', commandLine);
        });
    }

    ffmpegCommand
        .on('error', (err) => {
            logError(1, reason || 'Ошибка при обработке видео:', err);
            reject(reason);
        })
        .on('end', () => resolve(outputPath));

    return ffmpegCommand;
};

export const prepareOutputFileName = (
    inputFileName: string,
    {outputFileName, suffix, extention}: PrepareOoutputFileNameOptions,
) => {
    const outputDir = dirname(inputFileName);
    if (outputFileName) {
        return join(outputDir, outputFileName);
    }
    if (suffix && extention) {
        return inputFileName.replace(extention, `${suffix}${extention}`);
    }

    throw new Error('Not sufficient data provided');
};

export const getVideoDuration = (inputPath: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, data) => {
            if (err && !data.format.duration) {
                reject(err);
                return;
            }
            resolve(data.format.duration as number);
        });
    });
};

export const logStreamsInfo = async (inputPath: string) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, dataLocal) => {
            if (err) {
                reject(err);
                return;
            }
            log('Streams of ', inputPath);
            dataLocal.streams.forEach((stream) => {
                log(stream);
            });
            log('\n\n');

            resolve(true);
        });
    });
};

export const checkHasAudio = (input: string) => {
    return new Promise<boolean>((resolve, reject) => {
        ffmpeg.ffprobe(input, (err, dataLocal) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(
                dataLocal.streams.some((stream) => {
                    //  log({stream});
                    return stream.codec_type === 'audio';
                }),
            );
        });
    });
};

type SplitVideoArgs = {
    input: string;
    outputOverride: string;
    startTime: number;
    duration?: number;
};

export const splitVideo = ({
    input,
    outputOverride,
    startTime,
    duration,
}: SplitVideoArgs): Promise<string> => {
    const outputPath = prepareOutputFileName(input, {
        outputFileName: outputOverride || 'splitted_video.mp4',
    });

    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(input).setStartTime(startTime);

        if (duration) {
            ffmpegCommand.setDuration(duration);
        }

        ffmpegCommand.output(outputPath).on('end', () => resolve(outputPath));

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'splitVideo').run();
    });
};

type ExtractFramesArgs = {
    input: string;
    startTime: number;
    outputOverride?: string;
    frames?: number;
};

export const extractFrames = ({
    input,
    outputOverride,
    startTime,
    frames = 1,
}: ExtractFramesArgs): Promise<string> => {
    const outputPath = prepareOutputFileName(input, {
        outputFileName: outputOverride || 'frame.png',
    });

    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(input)
            .setStartTime(startTime)
            .frames(frames)
            .output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'extractFrames').run();
    });
};

type CreateVideoOfFrameArgs = {
    input: string;
    outputOverride?: string;
    duration: number;
};

export const createVideoOfFrame = ({
    input,
    outputOverride,
    duration,
}: CreateVideoOfFrameArgs): Promise<string> => {
    const outputPath = prepareOutputFileName(input, {
        outputFileName: outputOverride || 'frame.mp4',
    });

    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg()
            .input(input) // Input the frame
            .loop(1)
            .setDuration(duration) // Set duration to the second video's duration
            .audioCodec('aac') // Use AAC for audio
            .audioChannels(2) // Set channels (adjust if needed)
            .audioFrequency(44100) // Set frequency (adjust if needed)
            .outputOptions(['-shortest']) // Use shortest to avoid mismatch issues
            .output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'createVideoOfFrame').run();
    });
};

type AddSilentAudioStreamArgs = {
    input: string;
    // duration?: number;
    // hasAudio?: boolean;
};

export const addSilentAudioStream = async ({input}: AddSilentAudioStreamArgs): Promise<string> => {
    const hasAudio = await checkHasAudio(input);
    const duration = await getVideoDuration(input);

    const outputPath = prepareOutputFileName(input, {
        suffix: '_audio',
        extention: '.mp4',
    });

    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(input);

        ffmpegCommand
            .complexFilter([
                '[0:v]copy[v]', // Copy video stream
                hasAudio ? '[0:a]anull[a]' : 'anullsrc=r=44100:d=' + duration + '[a]', // Generate silent audio or discard if exists
                '[v][a]concat=n=1:v=1:a=1[outv][outa]', // Concatenate video and audio
            ])
            .map('[outv]') // Map the video output stream
            .map('[outa]') // Map the audio output stream
            // .videoCodec('copy') // This is important to avoid re-encoding if possible
            .audioCodec('aac') // Use AAC audio codec
            .outputOptions(['-shortest']) // Make output duration match shortest input
            .output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'createVideoOfFrame').run();
    });
};

export const saveFileList = (listPash: string, ...args: string[]) => {
    const fileList = args.map((filePath) => `file '${filePath}'`).join('\n');

    writeFileSync(listPash, fileList, 'utf-8');
};

export const concatVideoFromList = (list: string, output: string) => {
    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg()
            .input(list)
            .inputOptions(['-f concat', '-safe 0'])
            .output(output)
            .videoCodec('copy') // Copy video if possible.  If you skipped formatting, this is essential!
            .audioCodec('aac'); // Ensure consistent audio codec

        ffmpegCommon(ffmpegCommand, resolve, reject, output, 'concatVideoFromList').run();
    });
};

export const normalizeVideo = (input: string): Promise<string> => {
    const outputPath = prepareOutputFileName(input, {suffix: '_normilized', extention: '.mp4'});

    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(input)
            .videoCodec('libx264') // Используем libx264 для видео
            .audioCodec('aac') // Используем AAC для аудио
            .outputOptions([
                '-pix_fmt yuv420p', // Формат пикселей
                '-r 60', // Частота кадров
                '-vf scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1', // Масштабирование и паддинг
                '-ar 44100', // Частота дискретизации аудио
                '-ac 2', // Стерео звук
            ])
            .output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'normalizeVideo').run();
    });
};

// /Users/niktverd/code/instagram-video-downloader/green.mp4
type CoverWithGreenArgs = {
    input: string;
    green: string;
    startTime: number;
    duration: number;
    outputOverride?: string;
    padding?: number;
};

export const coverWithGreen = async ({
    input,
    green,
    startTime,
    duration,
    padding = 0,
}: CoverWithGreenArgs): Promise<string> => {
    const outputPath = prepareOutputFileName(input, {
        suffix: '_green_covered',
        extention: '.mp4',
    });
    log('coverWithGreen', {
        input,
        outputPath,
        green,
        startTime,
        duration,
    });
    const complexFilters = [
        // Применяем chromakey к видео с зеленым экраном
        {
            filter: 'chromakey',
            options: {
                color: '0x00ff00', // Цвет зеленого экрана
                similarity: 0.1, // Порог схожести
                blend: 0.2, // Порог смешивания
            },
            inputs: '[1:v]', // Вход: видео с зеленым экраном
            outputs: '[ckout]', // Выход: видео без зеленого экрана
        },
        // Масштабируем наложенное видео с сохранением пропорций
        {
            filter: 'scale',
            options: {
                width: `iw-${padding * 2}`, // Ширина = ширина основного видео минус отступы
                height: `ih-${padding * 2}`, // Высота = высота основного видео минус отступы
                force_original_aspect_ratio: 'decrease', // Сохраняем пропорции
            },
            inputs: '[ckout]', // Вход: видео без зеленого экрана
            outputs: '[scaled]', // Выход: масштабированное видео
        },
        // Синхронизируем начало наложенного видео с моментом startTime основного видео
        {
            filter: 'setpts',
            options: `PTS-STARTPTS+${startTime}/TB`, // Сдвигаем PTS (Presentation Timestamp) на startSeconds
            inputs: '[scaled]', // Вход: видео без зеленого экрана
            outputs: '[synced]', // Выход: синхронизированное видео
        },
        // Наложение синхронизированного видео на основное видео
        {
            filter: 'overlay',
            options: {
                x: '(W-w)/2', // Центрируем по горизонтали
                y: '(H-h)/2', // Центрируем по вертикали
                enable: `between(t,${startTime},${startTime + duration})`, // Наложение активно только в указанный период
            },
            inputs: ['[0:v]', '[synced]'], // Входы: основное видео и синхронизированное видео
            outputs: '[out]', // Выход: финальное видео
        },
        // Задержка аудио наложенного видео на startSeconds
        {
            filter: 'adelay',
            // options: `${startTime * 1000}|${startTime * 1000}`, // Задержка в миллисекундах (для стерео)
            options: `${startTime * 1000}|${startTime * 1000}`, // Задержка в миллисекундах (для стерео)
            inputs: '[1:a]', // Вход: аудио из наложенного видео
            outputs: '[delayed]', // Выход: задержанное аудио
        },
        {
            filter: 'amix',
            options: {inputs: 2, duration: 'first', dropout_transition: 0},
            inputs: ['[0:a]', '[delayed]'],
            outputs: '[outa]',
        },
    ];
    // ].filter((filter) => filter !== 'none');

    log('complexFilters', complexFilters);

    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg()
            .input(input) // Основное видео
            .input(green) // Видео с зеленым экраном
            .complexFilter(complexFilters)
            .outputOptions(
                [
                    '-map [out]', // Используем финальный видеопоток
                    '-map [outa]', // Используем финальный аудиопоток
                    '-c:v libx264', // Кодируем видео в H.264
                    '-c:a aac', // Копируем аудио без перекодировки
                ].filter((outputOption) => outputOption !== 'none'),
            );

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'coverWithGreen').save(outputPath);
    });
};
