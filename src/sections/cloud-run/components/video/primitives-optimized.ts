import {log} from 'console';

import ffmpeg from 'fluent-ffmpeg';

import {checkHasAudio, getVideoDuration, getVideoResolution} from './ffprobe.helpers';

interface ComplexFilter {
    filter: string;
    inputs: string | string[];
    outputs: string | string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>;
}

const generateRandomString = (length: number): string => {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
};

// --- Утилита для relabeling complexFilters при concat ---
/**
 * Переименовывает все stream labels в complexFilters пайплайна, чтобы избежать конфликтов при concat.
 * @param pipeline VideoPipeline
 * @param inputIndex индекс входного файла (0, 1, 2, ...)
 * @returns Новый массив complexFilters с переименованными labels
 */
function relabelPipelineStreams(pipeline: VideoPipeline, inputIndex: number): ComplexFilter[] {
    const inputVideo = `[${inputIndex}:v]`;
    const inputAudio = `[${inputIndex}:a]`;
    const origVideo = '[0:v]';
    const origAudio = '[0:a]';
    const relabel = (label: string) => {
        if (label === origVideo) return inputVideo;
        if (label === origAudio) return inputAudio;
        return label;
    };
    return pipeline.complexFilters.map((f) => ({
        ...f,
        inputs: Array.isArray(f.inputs) ? f.inputs.map(relabel) : relabel(f.inputs),
        outputs: f.outputs, // outputs не трогаем!
    }));
}

type VideoPipelineConstructor = {
    width: number;
    height: number;
    isMaster?: boolean;
};

export class VideoPipeline {
    prefix: string;
    inputs: string[] = [];
    complexFilters: ComplexFilter[] = [];
    currentAudioStream: string;
    currentVideoStream: string;
    currentStreamIndex: number;
    width = 720;
    height = 1280;
    targetWidth: number;
    targetHeight: number;
    isMaster: boolean;
    hasAudio: boolean | undefined;
    duration: number | undefined;

    constructor({width, height, isMaster}: VideoPipelineConstructor) {
        this.prefix = generateRandomString(2);
        this.currentAudioStream = '[0:a]';
        this.currentVideoStream = '[0:v]';
        this.currentStreamIndex = 1;
        this.isMaster = isMaster ?? false;
        this.targetHeight = height;
        this.targetWidth = width;
        this.inputs = [];
    }

    async init(input: string): Promise<VideoPipeline> {
        log('init started');
        // Проверка наличия аудиопотока
        try {
            this.hasAudio = await checkHasAudio(input);
        } catch (err) {
            throw new Error(
                `Ошибка при проверке наличия аудиопотока: ${
                    err instanceof Error ? err.message : String(err)
                }`,
            );
        }

        this.inputs.push(input);

        const {width, height} = await getVideoResolution(input);
        this.duration = await getVideoDuration(input);

        this.width = width;
        this.height = height;
        return this.normalize();
    }

    async run(output: string): Promise<string> {
        log('run started');
        return new Promise((resolve, reject) => {
            if (!this.inputs || this.inputs.length === 0) {
                reject(new Error('Input files are not set'));
                return;
            }

            let command: ffmpeg.FfmpegCommand;
            // Fallback: если только один input, работаем как раньше

            if (this.inputs.length === 1) {
                command = ffmpeg(this.inputs[0]);
            } else {
                command = ffmpeg();
                for (const input of this.inputs) {
                    command = command.input(input);
                }
            }

            // Гарантируем, что currentVideoStream/currentAudioStream указывают на финальные потоки
            const finalVideoStream = this.currentVideoStream;
            const finalAudioStream = this.currentAudioStream;

            if (this.complexFilters.length > 0) {
                command = command.complexFilter(this.complexFilters);
                // Map final streams
                command = command.outputOptions([
                    `-map ${finalVideoStream}`,
                    `-map ${finalAudioStream}`,
                    '-c:v libx264',
                    '-c:a aac',
                ]);
            }
            command = command
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions(['-pix_fmt yuv420p', '-r 60', '-ar 44100', '-ac 2']);
            // Если был добавлен silent audio, добавить -shortest
            if (this.hasAudio === false) {
                command = command.outputOptions(['-shortest']);
            }
            command = command.output(output);

            // Условия для логирования событий
            if (process.env.ENABLE_START === 'true') {
                command.on('start', (cmdLine: string) => {
                    console.log(`FFmpeg process started: ${cmdLine}`);
                });
            }
            if (process.env.ENABLE_PROGRESS === 'true') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                command.on('progress', (progress: any) => {
                    console.log(`VideoPipeline.run progress: ${progress.percent}%`);
                });
            }
            if (process.env.ENABLE_STDERR === 'true') {
                command.on('stderr', (stderrLine: string) => {
                    console.error('FFmpeg stderr:', stderrLine);
                });
            }
            command
                .on('end', () => {
                    console.log(`VideoPipeline.run completed successfully`);
                    resolve(output);
                })
                .on('error', (err: Error) => {
                    console.error(`VideoPipeline.run failed:`, err);
                    reject(err);
                })
                .run();
        });
    }

    makeItRed(): VideoPipeline {
        log('makeItRed started');
        return this.wrap(() => {
            // 1. Split input into two streams: original and red
            const inputLabel = this.currentVideoStream;

            // 2. Isolate red channel (zero out green and blue)
            const redChannelLabel = this.getNewVideoStream();
            const lutrgbFilter: ComplexFilter = {
                filter: 'lutrgb',
                inputs: inputLabel,
                outputs: redChannelLabel,
                options: {r: 'val', g: '0', b: '0'},
            };

            // 3. Convert red channel to grayscale
            const isolatedLabel = this.getNewVideoStream();
            const lutYuvFilter: ComplexFilter = {
                filter: 'lutyuv',
                inputs: redChannelLabel,
                outputs: isolatedLabel,
                options: {y: 'val'},
            };

            return [lutrgbFilter, lutYuvFilter];
        });
    }

    rotate(angle = 0, scale?: number): VideoPipeline {
        return this.wrap(() => {
            log('rotate started');
            try {
                const localScale =
                    scale ??
                    1 +
                        (Math.max(this.width, this.height) / Math.min(this.width, this.height)) *
                            ((Math.abs(angle) * Math.PI) / 180);

                // Вычисляем размеры повернутого слоя
                const angleRad = (Math.abs(angle) * Math.PI) / 180;
                const scaledWidth = this.width * localScale;
                const scaledHeight = this.height * localScale;
                const rotatedWidth = Math.ceil(
                    scaledWidth * Math.abs(Math.cos(angleRad)) +
                        scaledHeight * Math.abs(Math.sin(angleRad)),
                );
                const rotatedHeight = Math.ceil(
                    scaledWidth * Math.abs(Math.sin(angleRad)) +
                        scaledHeight * Math.abs(Math.cos(angleRad)),
                );

                // 1. Split текущий поток на два: фон и слой для поворота
                const sourceLabel = this.currentVideoStream;
                const bgStreamLabel = this.getNewVideoStream();
                const rotateStreamLabel = this.getNewVideoStream();
                const splitFilter: ComplexFilter = {
                    filter: 'split',
                    inputs: sourceLabel,
                    outputs: [bgStreamLabel, rotateStreamLabel],
                    options: {outputs: 2},
                };

                // 2. Фон (background) - scale + setsar
                const bgLabel = this.getNewVideoStream();
                const bgFilter: ComplexFilter = {
                    filter: 'scale',
                    inputs: bgStreamLabel,
                    outputs: bgLabel,
                    options: {
                        width: this.targetWidth,
                        height: this.targetHeight,
                    },
                };
                const setsarLabel = this.getNewVideoStream();
                const setsarFilter: ComplexFilter = {
                    filter: 'setsar',
                    inputs: bgLabel,
                    outputs: setsarLabel,
                    options: {sar: 1},
                };

                // 3. Поворот - scale + rotate
                const scaledLabel = this.getNewVideoStream();
                const scaleFilter: ComplexFilter = {
                    filter: 'scale',
                    inputs: rotateStreamLabel,
                    outputs: scaledLabel,
                    options: {
                        width: `iw*${localScale}`,
                        height: `ih*${localScale}`,
                    },
                };
                const rotatedLabel = this.getNewVideoStream();
                const rotateFilter: ComplexFilter = {
                    filter: 'rotate',
                    inputs: scaledLabel,
                    outputs: rotatedLabel,
                    options: {
                        angle: `${angle}*PI/180`,
                        ow: rotatedWidth,
                        oh: rotatedHeight,
                        fillcolor: 'black@0',
                    },
                };

                // 4. Overlay повернутого слоя поверх фона
                const outLabel = this.getNewVideoStream();
                const overlayFilter: ComplexFilter = {
                    filter: 'overlay',
                    inputs: [setsarLabel, rotatedLabel],
                    outputs: outLabel,
                    options: {
                        x: '(W-w)/2',
                        y: '(H-h)/2',
                    },
                };

                return [
                    splitFilter,
                    bgFilter,
                    setsarFilter,
                    scaleFilter,
                    rotateFilter,
                    overlayFilter,
                ];
            } catch (err) {
                log('rotate error', err);
                throw err;
            }
        });
    }

    concat(p: VideoPipeline): VideoPipeline {
        return this.wrap(() => {
            if (!this.isMaster) {
                throw new Error('Concat can only be called on a master VideoPipeline');
            }

            const filtersToAdd: ComplexFilter[] = [];

            // Добавляем input pipeline
            if (!p.inputs || p.inputs.length === 0 || p.complexFilters.length === 0) {
                throw new Error('Cannot concat pipeline with empty inputs');
            }

            this.inputs.push(...p.inputs);
            const masterInputIdx = this.inputs.length - 1;

            const relabeledFilters = relabelPipelineStreams(p, masterInputIdx);
            filtersToAdd.push(...relabeledFilters);

            // Собираем финальные video/audio outputs для master (текущий результат) и p (новый pipeline)
            // Для master всегда берем текущие this.currentVideoStream/this.currentAudioStream
            const videoStreams = [this.currentVideoStream, p.currentVideoStream];
            const audioStreams = [this.currentAudioStream, p.currentAudioStream];
            // Добавляем concat-фильтр
            const concatVideoLabel = this.getNewVideoStream();
            const concatAudioLabel = this.getNewAudioStream();
            // Новый порядок: [video1, audio1, video2, audio2]
            const concatInputs = videoStreams.map((v, i) => [v, audioStreams[i]]).flat();
            filtersToAdd.push({
                filter: 'concat',
                inputs: concatInputs,
                outputs: [concatVideoLabel, concatAudioLabel],
                options: {n: 2, v: 1, a: 1},
            });

            return filtersToAdd;
        });
    }

    normalize(): VideoPipeline {
        return this.wrap(() => {
            log('\n\n\n normalize started');
            const inputVideoStream = this.currentVideoStream;
            const outputVideoStream = this.getNewVideoStream();

            const scaleFilter: ComplexFilter = {
                filter: 'scale',
                inputs: inputVideoStream,
                outputs: outputVideoStream,
                options: {
                    width: 720,
                    height: 1280,
                    force_original_aspect_ratio: 'decrease',
                },
            };

            const paddedStream = this.getNewVideoStream();

            const padFilter: ComplexFilter = {
                filter: 'pad',
                inputs: outputVideoStream,
                outputs: paddedStream,
                options: {
                    width: 720,
                    height: 1280,
                    x: '(ow-iw)/2',
                    y: '(oh-ih)/2',
                },
            };

            const finalStream = this.getNewVideoStream();

            const setsarFilter: ComplexFilter = {
                filter: 'setsar',
                inputs: paddedStream,
                outputs: finalStream,
                options: {
                    sar: 1,
                },
            };

            const audioStreamInput = this.currentAudioStream;
            const audioStreamOutput = this.getNewAudioStream();
            const firstAudioFilter =
                this.hasAudio === false
                    ? {
                          filter: 'anullsrc',
                          inputs: [],
                          outputs: audioStreamOutput,
                          options: {
                              r: 44100,
                              d: this.duration,
                          },
                      }
                    : {
                          filter: 'anull',
                          inputs: audioStreamInput,
                          outputs: audioStreamOutput,
                      };

            log('\n\n\n normalize finished', {
                scaleFilter,
                padFilter,
                setsarFilter,
                firstAudioFilter,
            });
            return [scaleFilter, padFilter, setsarFilter, firstAudioFilter];
        });
    }

    private getNewAudioStream(): string {
        this.currentStreamIndex++;
        const streamLabel = `[a_${this.prefix}_${this.currentStreamIndex}]`;
        this.currentAudioStream = streamLabel;
        return streamLabel;
    }

    private getNewVideoStream(): string {
        this.currentStreamIndex++;
        const streamLabel = `[v_${this.prefix}_${this.currentStreamIndex}]`;
        this.currentVideoStream = streamLabel;
        return streamLabel;
    }

    private wrap(fn: () => ComplexFilter[]): VideoPipeline {
        const filters = fn();
        this.complexFilters.push(...filters);
        return this;
    }
}
