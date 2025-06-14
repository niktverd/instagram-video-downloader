import ffmpeg from 'fluent-ffmpeg';

import {log} from '#utils';

/**
 * Получает разрешение (ширину и высоту) первого видеопотока файла.
 * @param input - Путь к видеофайлу
 * @returns Promise<{width: number; height: number}> — объект с шириной и высотой
 * @throws Если не удалось определить разрешение
 * @example
 *   const {width, height} = await getVideoResolution('video.mp4');
 */
export async function getVideoResolution(input: string): Promise<{width: number; height: number}> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(input, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                const {width, height} =
                    metadata.streams.find((stream) => stream.codec_type === 'video') || {};
                if (width && height) {
                    resolve({width, height});
                } else {
                    reject(new Error('Could not determine video resolution'));
                }
            }
        });
    });
}

/**
 * Получает длительность видеофайла в секундах.
 * @param input - Путь к видеофайлу
 * @returns Promise<number> — длительность в секундах
 * @throws Если не удалось получить длительность
 * @example
 *   const duration = await getVideoDuration('video.mp4');
 */
export async function getVideoDuration(input: string): Promise<number> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(input, (err, data) => {
            if (err || !data?.format?.duration) {
                reject(new Error('Не удалось получить длительность видео через ffprobe'));
                return;
            }
            resolve(data.format.duration as number);
        });
    });
}

/**
 * Проверяет, есть ли в файле хотя бы один аудиопоток.
 * @param input - Путь к видеофайлу
 * @returns Promise<boolean> — true если есть аудиопоток, иначе false
 * @throws Если ffprobe завершился с ошибкой
 * @example
 *   const hasAudio = await checkHasAudio('video.mp4');
 */
export async function checkHasAudio(input: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(input, (err, metadata) => {
            if (err) {
                reject(err);
                return;
            }
            const hasAudio = metadata.streams.some((stream) => stream.codec_type === 'audio');
            resolve(hasAudio);
        });
    });
}

/**
 * Логирует информацию о всех стримах файла (видео, аудио и др.) в консоль.
 * @param input - Путь к видеофайлу
 * @returns Promise<boolean> — true если успешно
 * @throws Если ffprobe завершился с ошибкой
 * @example
 *   await logStreamsInfo('video.mp4');
 */
export async function logStreamsInfo(input: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(input, (err, dataLocal) => {
            if (err) {
                reject(err);
                return;
            }
            // eslint-disable-next-line no-console
            log('Streams of ', input);
            dataLocal.streams.forEach((stream) => {
                // eslint-disable-next-line no-console
                log(stream);
            });
            // eslint-disable-next-line no-console
            log('\n\n');
            resolve(true);
        });
    });
}

/**
 * Читает все доступные метаданные из файла (формат и потоки).
 * @param input - Путь к видеофайлу
 * @returns Promise<Record<string, string>> — объект с метаданными
 * @throws Если ffprobe завершился с ошибкой
 * @example
 *   const meta = await readMetadata('video.mp4');
 *   log(meta.title, meta.artist);
 */
export async function readMetadata(input: string): Promise<Record<string, string>> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(input, (err, metadata) => {
            if (err) {
                reject(err);
                return;
            }
            // Extract metadata from format tags
            const formatMetadata: Record<string, string> = {};
            if (metadata.format.tags) {
                Object.entries(metadata.format.tags).forEach(([key, value]) => {
                    formatMetadata[key] = String(value);
                });
            }
            // Also check for metadata in streams (particularly the first video and audio streams)
            const streamMetadata: Record<string, string> = {};
            metadata.streams.forEach((stream) => {
                if (stream.tags) {
                    Object.entries(stream.tags).forEach(([key, value]) => {
                        // Prefix stream metadata with stream type to avoid collisions
                        const streamType = stream.codec_type || 'unknown';
                        streamMetadata[`${streamType}_${key}`] = String(value);
                    });
                }
            });
            // Combine format and stream metadata, with format metadata taking precedence
            const result: Record<string, string> = {
                ...streamMetadata,
                ...formatMetadata,
            };
            resolve(result);
        });
    });
}
