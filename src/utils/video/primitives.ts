import {writeFileSync} from 'fs';

import ffmpeg from 'fluent-ffmpeg';

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
            console.log('Streams of ', inputPath);
            dataLocal.streams.forEach((stream) => {
                console.log(stream);
            });
            console.log('\n\n');

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
                    console.log({stream});
                    return stream.codec_type === 'audio';
                }),
            );
        });
    });
};

type SplitVideoArgs = {
    input: string;
    output: string;
    startTime: number;
    duration?: number;
};

export const splitVideo = ({input, output, startTime, duration}: SplitVideoArgs) => {
    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(input).setStartTime(startTime);

        if (duration) {
            ffmpegCommand.setDuration(duration);
        }

        ffmpegCommand
            .output(output)
            .on('end', resolve)
            .on('error', (err) => {
                console.error(1, 'Ошибка при обработке видео:', err);
                reject();
            })
            .run();
    });
};

type ExtractFramesArgs = {
    input: string;
    output: string;
    startTime: number;
    frames?: number;
};

export const extractFrames = ({input, output, startTime, frames = 1}: ExtractFramesArgs) => {
    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .setStartTime(startTime)
            .frames(frames)
            .output(output)
            .on('end', resolve)
            .on('error', (err) => {
                console.error(1, 'Ошибка при обработке видео:', err);
                reject();
            })
            .run();
    });
};

type CreateVideoOfFrameArgs = {
    input: string;
    output: string;
    duration: number;
};

export const createVideoOfFrame = ({input, output, duration}: CreateVideoOfFrameArgs) => {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(input) // Input the frame
            .loop(1)
            .setDuration(duration) // Set duration to the second video's duration
            .audioCodec('aac') // Use AAC for audio
            .audioChannels(2) // Set channels (adjust if needed)
            .audioFrequency(44100) // Set frequency (adjust if needed)
            .outputOptions(['-shortest']) // Use shortest to avoid mismatch issues
            .output(output)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
};

type AddSilentAudioStreamArgs = {
    input: string;
    output: string;
    duration: number;
    hasAudio?: boolean;
};

export const addSilentAudioStream = ({
    input,
    output,
    duration,
    hasAudio = false,
}: AddSilentAudioStreamArgs) => {
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
            .output(output)
            .on('stderr', (stderrLine) => {
                console.error(2, 'FFmpeg stderr:', stderrLine);
            })
            .on('end', resolve)
            .on('error', (err) => {
                console.error('Error adding silence to video:', err);
                reject(err);
            })
            .run();
    });
};

export const saveFileList = (listPash: string, ...args: string[]) => {
    const fileList = args.map((filePath) => `file '${filePath}'`).join('\n');

    writeFileSync(listPash, fileList, 'utf-8');
};

export const concatVideoFromList = (list: string, output: string) => {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(list)
            .inputOptions(['-f concat', '-safe 0'])
            .output(output)
            .videoCodec('copy') // Copy video if possible.  If you skipped formatting, this is essential!
            .audioCodec('aac') // Ensure consistent audio codec
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
};

export const normalizeVideo = (input: string, output: string) => {
    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .videoCodec('libx264') // Используем libx264 для видео
            .audioCodec('aac') // Используем AAC для аудио
            .outputOptions([
                '-pix_fmt yuv420p', // Формат пикселей
                '-r 30', // Частота кадров
                '-vf scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1', // Масштабирование и паддинг
                '-ar 44100', // Частота дискретизации аудио
                '-ac 2', // Стерео звук
            ])
            .output(output)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
};
