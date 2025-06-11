import * as crypto from 'crypto';
import {writeFileSync} from 'fs';
import {dirname, join} from 'path';

import ffmpeg, {FfmpegCommand} from 'fluent-ffmpeg';

import {checkHasAudio, getVideoDuration, getVideoResolution} from './ffprobe.helpers';

import {ThrownError} from '#src/utils/error';
import {log, logError} from '#utils';

type PrepareOoutputFileNameOptions = {
    outputFileName?: string;
    suffix?: string;
    extention?: string;
};

const ENABLE_STDERR = process.env.ENABLE_STDERR === 'true';
const ENABLE_PROGRESS = process.env.ENABLE_PROGRESS === 'true';
const ENABLE_START = process.env.ENABLE_START === 'true';

const ffmpegCommon = (
    ffmpegCommand: FfmpegCommand,
    resolve: (outputPash: string) => void,
    reject: (reason?: string) => void,
    outputPath: string,
    reason?: string,
) => {
    log({outputPath, reason});

    if (ENABLE_STDERR) {
        ffmpegCommand.on('stderr', (stderrLine) => {
            logError('FFmpeg stderr:', stderrLine);
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
            logError(reason, 'Ошибка при обработке видео:', err);
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

    throw new ThrownError('Not sufficient data provided', 400);
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

type TrimVideoArgs = {
    input: string;
    maxDuration: number;
    outputOverride?: string;
};

export const trimVideo = async ({input, maxDuration}: TrimVideoArgs): Promise<string> => {
    const duration = await getVideoDuration(input);

    if (duration <= maxDuration) {
        return input;
    }

    const outputPath = prepareOutputFileName(input, {
        suffix: '_trimmed',
        extention: '.mp4',
    });

    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(input).duration(maxDuration).output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'trimVideo').run();
    });
};

type OverlayImageOptions = {
    input: string;
    overlayImage: string;
    left?: number; // Процент от ширины видео
    top?: number; // Процент от высоты видео
    width?: number; // Процент от ширины видео
    height?: number; // Процент от высоты видео
    startTime?: number; // Начало появления изображения (сек)
    duration?: number; // Длительность показа (сек)
};

export const overlayImageOnVideo = async ({
    input,
    overlayImage,
    left = 0, // По умолчанию центр (50%)
    top = 0,
    width = 100, // 20% ширины видео
    height = 100, // 20% высоты видео
    startTime = 0,
    duration,
}: OverlayImageOptions): Promise<string> => {
    const outputPath = prepareOutputFileName(input, {
        suffix: '_covered_with_image',
        extention: '.mp4',
    });

    const videoDuration = await getVideoDuration(input);

    log({
        overlayImage,
        outputPath,
        left, // По умолчанию центр (50%)
        top,
        width, // 20% ширины видео
        height, // 20% высоты видео
        startTime,
        duration,
        videoDuration,
    });

    return new Promise((resolve, reject) => {
        const complexFilters = [
            // Масштабируем картинку с сохранением пропорций
            {
                filter: 'scale',
                options: {
                    width: `iw-${0 * 2}`, // Ширина = ширина основного видео минус отступы
                    height: `ih-${0 * 2}`, // Высота = высота основного видео минус отступы
                    force_original_aspect_ratio: 'decrease', // Сохраняем пропорции
                },
                inputs: '[1:v]', // Вход: видео без зеленого экрана
                outputs: '[scaledImage]', // Выход: масштабированное видео
            },
            // Наложение синхронизированного видео на основное видео
            {
                filter: 'overlay',
                options: {
                    x: '(W-w)/2', // Центрируем по горизонтали
                    y: '(H-h)/2', // Центрируем по вертикали
                    enable: `between(t,${startTime},${startTime + (duration || videoDuration)})`, // Наложение активно только в указанный период
                },
                inputs: ['[0:v]', '[scaledImage]'], // Входы: основное видео и синхронизированное видео
                outputs: '[out]', // Выход: финальное видео
            },
        ];

        const ffmpegCommand = ffmpeg(input)
            .input(overlayImage)
            .complexFilter(complexFilters)
            .outputOptions([
                '-map [out]', // Используем финальный видеопоток
                // '-map [0:a]', // Используем финальный аудиопоток
                '-map 0:a?',
                '-c:v libx264', // Кодируем видео в H.264
                '-c:a aac', // Копируем аудио без перекодировки
            ])
            .output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'covered_with_image').run();
    });
};

type ApplyVideoColorCorrectionArgs = {
    input: string;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    gamma?: number;
    pathSuffix?: string;
};

export const applyVideoColorCorrection = async ({
    input,
    brightness = 0,
    contrast = 1,
    saturation = 1,
    gamma = 1,
    pathSuffix = '',
}: ApplyVideoColorCorrectionArgs): Promise<string> => {
    const outputPath = prepareOutputFileName(input, {
        suffix: '_corrected' + pathSuffix,
        extention: '.mp4',
    });

    return new Promise((resolve, reject) => {
        const videoFilters: string[] = [];

        // Construct video filters conditionally to avoid empty or invalid filter chains
        if (brightness !== 0) {
            // Brightness adjustment (range typically -1 to 1)
            videoFilters.push(`eq=brightness=${brightness}`);
        }
        if (contrast !== 1) {
            // Contrast adjustment (1 is normal, 0 is grayscale, > 1 increases contrast)
            videoFilters.push(`eq=contrast=${contrast}`);
        }
        if (saturation !== 1) {
            // Saturation adjustment (1 is normal, 0 is grayscale, > 1 increases color intensity)
            videoFilters.push(`eq=saturation=${saturation}`);
        }
        if (gamma !== 1) {
            // Gamma correction (1 is normal, < 1 makes image lighter, > 1 makes image darker)
            videoFilters.push(`eq=gamma=${gamma}`);
        }

        const ffmpegCommand = ffmpeg(input)
            // Apply filters only if there are any
            .videoFilters(videoFilters.length > 0 ? videoFilters : [])
            .audioCodec('copy') // Preserve original audio
            .videoCodec('libx264') // Use H.264 video codec for compatibility
            .output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'videoColorCorrection').run();
    });
};

export const isolateRedObjects = async ({
    input,
    pathSuffix = '',
    color,
    similarity = 0.25,
    blend = 0.3,
}: {
    input: string;
    pathSuffix?: string;
    color: string;
    similarity?: number;
    blend?: number;
}): Promise<string> => {
    const outputPath = prepareOutputFileName(input, {
        suffix: '_red_isolated' + pathSuffix,
        extention: '.mp4',
    });

    return new Promise((resolve, reject) => {
        const filter = `colorhold=0x${color}:similarity=${similarity}:blend=${blend}`;
        const ffmpegCommand = ffmpeg(input)
            .outputOptions('-vf', filter)
            .audioCodec('copy') // Preserve original audio
            .videoCodec('libx264')
            .output(outputPath); // Use H.264 video codec

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'redObjectIsolation').run();
    });
};

export const makeItRed = async ({
    input,
    pathSuffix = '',
}: {
    input: string;
    pathSuffix?: string;
}): Promise<string> => {
    const outputPath = prepareOutputFileName(input, {
        suffix: '_red_isolated' + pathSuffix,
        extention: '.mp4',
    });

    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(input)
            .videoFilters([
                // Isolate red channel
                'split[original][red]',
                '[red]lutrgb=r=val:g=0:b=0[redchannel]',

                // Convert red channel to grayscale
                '[redchannel]lutyuv=y=val[isolated]',

                // Overlay the isolated channel
                '[original][isolated]overlay',
            ])
            .audioCodec('copy') // Preserve original audio
            .videoCodec('libx264') // Use H.264 video codec
            .outputOptions(['-pix_fmt', 'yuv420p'])
            .output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'redObjectIsolation').run();
    });
};

type RotateScaleVideoArgs = {
    input: string;
    angle: number;
    scale?: number;
    pathSuffix?: string;
};

export const rotateVideo = async ({
    input,
    angle,
    scale,
    pathSuffix = '',
}: RotateScaleVideoArgs): Promise<string> => {
    log('rotateVideo started');
    const outputPath = prepareOutputFileName(input, {
        suffix: '_rotaded' + pathSuffix,
        extention: '.mp4',
    });
    const {width, height} = await getVideoResolution(input);

    return new Promise((resolve, reject) => {
        const localScale =
            scale ??
            1 +
                (Math.max(width, height) / Math.min(width, height)) *
                    ((Math.abs(angle) * Math.PI) / 180);

        // Calculate rotated dimensions explicitly to avoid FFmpeg's rotw/roth boundary condition issues
        const angleRad = (Math.abs(angle) * Math.PI) / 180;
        const scaledWidth = width * localScale;
        const scaledHeight = height * localScale;
        const rotatedWidth = Math.ceil(
            scaledWidth * Math.abs(Math.cos(angleRad)) +
                scaledHeight * Math.abs(Math.sin(angleRad)),
        );
        const rotatedHeight = Math.ceil(
            scaledWidth * Math.abs(Math.sin(angleRad)) +
                scaledHeight * Math.abs(Math.cos(angleRad)),
        );

        const ffmpegCommand = ffmpeg(input)
            .complexFilter([
                // Scale the input video to original dimensions for background
                '[0:v] scale=iw:ih, setsar=1 [bg]',
                // Scale and rotate the foreground video with explicit output dimensions
                `[0:v] scale=iw*${localScale}:ih*${localScale}, rotate=${angle}*PI/180:ow=${rotatedWidth}:oh=${rotatedHeight} [overlay]`,
                // Overlay the rotated video onto the background at center
                '[bg][overlay] overlay=(W-w)/2:(H-h)/2 [out]',
            ])
            .outputOptions([
                '-map [out]', // Используем финальный видеопоток
                '-map 0:a?',
            ])
            .output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'rotateAndScaleVideo').run();
    });
};

type AddTextToVideoArgs = {
    input: string;
    text: string;
};

export const addTextToVideo = async ({input, text = ''}: AddTextToVideoArgs): Promise<string> => {
    log('addTextToVideo started');
    const outputPath = prepareOutputFileName(input, {
        suffix: '_with_text',
        extention: '.mp4',
    });
    const drawTextFilter = text
        ? `[v0]drawtext=text='${text}':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=h-text_h-10:box=1:boxcolor=black@0.5:boxborderw=0[outv]`
        : '';

    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(input)
            .complexFilter([drawTextFilter])
            .outputOptions([
                '-map [outv]', // Используем финальный видеопоток
                '-map 0:a?',
            ])
            .output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'addTextToVideo').run();
    });
};

type ChangeVideoSpeedArgs = {
    input: string;
    speed: number; // Value > 1 speeds up, < 1 slows down (e.g., 0.5 = half speed, 2 = double speed)
    outputOverride?: string;
};

export const changeVideoSpeed = async ({
    input,
    speed,
    outputOverride,
}: ChangeVideoSpeedArgs): Promise<string> => {
    log('changeVideoSpeed started');
    if (speed <= 0) {
        throw new ThrownError('Speed must be greater than 0', 400);
    }

    const suffix = (speed > 1 ? '_speedup' : '_slowdown') + `-${speed}`;
    const outputPath = prepareOutputFileName(input, {
        outputFileName: outputOverride,
        suffix,
        extention: '.mp4',
    });

    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(input)
            .videoFilters(`setpts=${1 / speed}*PTS`) // Adjust video speed
            .audioFilters(`atempo=${speed}`) // Adjust audio speed (atempo works best between 0.5 and 2.0)
            .outputOptions([
                '-c:v libx264', // Use H.264 codec for video
                '-c:a aac', // Use AAC codec for audio
                '-pix_fmt yuv420p', // Standard pixel format for compatibility
            ])
            .output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'changeVideoSpeed').run();
    });
};

type GenerateMetadataArgs = {
    input?: string;
    iteration?: number;
};

export const generateVideoMetadata = ({
    input = '',
    iteration = 0,
}: GenerateMetadataArgs = {}): Record<string, string> => {
    log('generateVideoMetadata started');
    const timestamp = Date.now();
    const randomHash = crypto
        .createHash('sha256')
        .update(`${timestamp}-${input}-${iteration}-${Math.random()}`)
        .digest('hex');

    const genres = ['Action', 'Drama', 'Comedy', 'Documentary', 'Music'];
    const languages = ['eng', 'fra', 'deu', 'spa', 'ita'];
    const encoders = ['x264', 'ffmpeg', 'HandBrake', 'Adobe', 'DaVinci'];

    return {
        title: `UniqueVideo_${randomHash.substring(0, 8)}`,
        artist: `Artist_${randomHash.substring(8, 16)}`,
        album: `Album_${randomHash.substring(16, 24)}`,
        date: new Date(timestamp + iteration * 1000).toISOString(),
        genre: genres[Math.floor(Math.random() * genres.length)],
        copyright: `Copyright_${randomHash.substring(24, 32)}`,
        encoder: encoders[Math.floor(Math.random() * encoders.length)],
        language: languages[Math.floor(Math.random() * languages.length)],
        comment: `Processed_${randomHash.substring(32, 40)}`,
        creation_time: new Date(timestamp + iteration * 2000).toISOString(),
        description: `Description_${randomHash.substring(40, 48)}`,
        publisher: `Publisher_${randomHash.substring(48, 56)}`,
        composer: `Composer_${randomHash.substring(56, 64)}`,
    };
};

type ApplyMetadataArgs = {
    input: string;
    metadata?: Record<string, string>;
    outputOverride?: string;
};

export const applyMetadata = async ({
    input,
    metadata,
    outputOverride,
}: ApplyMetadataArgs): Promise<string> => {
    log('applyMetadata started');
    const outputPath = prepareOutputFileName(input, {
        outputFileName: outputOverride,
        suffix: '_with_metadata',
        extention: '.mp4',
    });

    const metadataToApply = metadata || generateVideoMetadata({input});

    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(input).videoCodec('copy').audioCodec('copy');

        // Apply all metadata fields
        Object.entries(metadataToApply).forEach(([key, value]) => {
            ffmpegCommand.outputOptions('-metadata', `${key}=${value}`);
        });

        ffmpegCommand.output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'applyMetadata').run();
    });
};

type HueAdjustVideoArgs = {
    input: string;
    hue?: number; // Hue adjustment in degrees (-180 to 180)
    saturation?: number; // Saturation multiplier (0-2, where 1 is normal)
    pathSuffix?: string;
};

export const hueAdjustVideo = async ({
    input,
    hue = 0,
    saturation = 1,
    pathSuffix = '',
}: HueAdjustVideoArgs): Promise<string> => {
    log('hueAdjustVideo started');
    const outputPath = prepareOutputFileName(input, {
        suffix: '_hue_adjusted' + pathSuffix,
        extention: '.mp4',
    });

    return new Promise((resolve, reject) => {
        // Build the hue filter string
        const hueFilter = `hue=h=${hue}:s=${saturation}`;

        const ffmpegCommand = ffmpeg(input)
            .videoFilters(hueFilter)
            .audioCodec('copy') // Preserve original audio
            .videoCodec('libx264') // Use H.264 video codec for compatibility
            .output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'hueAdjustVideo').run();
    });
};

type ApplyBoxBlurArgs = {
    input: string;
    boxWidth?: number; // Width of the box blur (default: 2)
    boxHeight?: number; // Height of the box blur (default: 2)
    iterations?: number; // Number of iterations (default: 1)
    pathSuffix?: string;
};

export const applyBoxBlur = async ({
    input,
    boxWidth = 2,
    boxHeight = 2,
    iterations = 1,
    pathSuffix = '',
}: ApplyBoxBlurArgs): Promise<string> => {
    log('applyBoxBlur started');
    const outputPath = prepareOutputFileName(input, {
        suffix: '_blurred' + pathSuffix,
        extention: '.mp4',
    });

    return new Promise((resolve, reject) => {
        // Build the boxblur filter string
        const blurFilter = `boxblur=${boxWidth}:${boxHeight}:${iterations}`;

        const ffmpegCommand = ffmpeg(input)
            .videoFilters(blurFilter)
            .audioCodec('copy') // Preserve original audio
            .videoCodec('libx264') // Use H.264 video codec for compatibility
            .output(outputPath);

        ffmpegCommon(ffmpegCommand, resolve, reject, outputPath, 'applyBoxBlur').run();
    });
};
