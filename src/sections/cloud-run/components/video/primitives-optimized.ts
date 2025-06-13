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
    // Регулярки для поиска [N:v] и [N:a]
    const videoRegex = /^\[(\d+):v\]$/;
    const audioRegex = /^\[(\d+):a\]$/;
    const relabel = (label: string): string => {
        const videoMatch = label.match(videoRegex);
        if (videoMatch) {
            const idx = parseInt(videoMatch[1], 10);
            return `[${inputIndex + idx}:v]`;
        }
        const audioMatch = label.match(audioRegex);
        if (audioMatch) {
            const idx = parseInt(audioMatch[1], 10);
            return `[${inputIndex + idx}:a]`;
        }
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

// Интерфейс для colorCorrect
export interface ColorCorrectionOptions {
    brightness?: number; // -1.0 ... 1.0 (default 0)
    contrast?: number; // 0.0 ... 3.0 (default 1)
    saturation?: number; // 0.0 ... 3.0 (default 1)
    gamma?: number; // 0.1 ... 3.0 (default 1)
}

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
    compoundDuration: number | undefined;

    constructor({width, height, isMaster}: VideoPipelineConstructor) {
        this.prefix = generateRandomString(2);
        this.currentAudioStream = '[0:a]';
        this.currentVideoStream = '[0:v]';
        this.currentStreamIndex = 1;
        this.isMaster = isMaster ?? false;
        this.targetHeight = height;
        this.targetWidth = width;
        this.inputs = [];
        this.compoundDuration = undefined;
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
        this.compoundDuration = this.duration;

        this.width = width;
        this.height = height;
        return this.normalize();
    }

    async run(output: string): Promise<string> {
        log('run started');
        log('run inputs', this.inputs);
        log('run output', output);
        log('run complexFilters', this.complexFilters);
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
        // compoundDuration: сумма длительностей
        if (typeof this.compoundDuration === 'number' && typeof p.compoundDuration === 'number') {
            this.compoundDuration += p.compoundDuration;
        } else {
            this.compoundDuration = undefined;
        }
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

    // eslint-disable-next-line valid-jsdoc
    /**
     * Наложение другого VideoPipeline поверх текущего
     * @param overlayPipeline - VideoPipeline для наложения
     * @param options - параметры наложения
     */
    overlayWith(
        overlayPipeline: VideoPipeline,
        options: {
            startTime: number;
            duration: number;
            chromakey?: boolean;
            padding?: number;
            audioMode?: 'mix' | 'replace';
        },
    ): VideoPipeline {
        if (!this.isMaster) {
            throw new Error('overlayWith can only be called on a master VideoPipeline');
        }
        const {startTime = 0, duration, padding, audioMode = 'mix', chromakey = '00ff00'} = options;
        if (typeof startTime !== 'number' || startTime < 0) {
            throw new Error('overlayWith: startTime must be >= 0');
        }
        if (typeof duration !== 'number' || duration <= 0) {
            throw new Error('overlayWith: duration must be > 0');
        }
        if (typeof padding !== 'undefined' && padding < 0) {
            throw new Error('overlayWith: padding must be >= 0');
        }

        log('overlayWith started', {startTime, duration, padding, audioMode, chromakey});

        return this.wrap(() => {
            const filtersToAdd: ComplexFilter[] = [];

            // Add overlay pipeline input(s)
            const overlayInputIdx = this.inputs.length;
            this.inputs.push(...overlayPipeline.inputs);

            // Relabel overlay pipeline streams to avoid conflicts
            const relabeledOverlayFilters = relabelPipelineStreams(
                overlayPipeline,
                overlayInputIdx,
            );
            filtersToAdd.push(...relabeledOverlayFilters);

            const baseVideoStream = this.currentVideoStream;
            const baseAudioStream = this.currentAudioStream;

            // Overlay video stream label (after relabel)
            // Overlay audio stream label (after relabel)
            const overlayVideoStream = overlayPipeline.currentVideoStream;
            const overlayAudioStream = overlayPipeline.currentAudioStream;

            // setpts for video timing sync (shift overlay to startTime)
            const setptsStream = this.getNewVideoStream();
            filtersToAdd.push({
                filter: 'setpts',
                inputs: overlayVideoStream,
                outputs: setptsStream,
                options: {expr: `PTS-STARTPTS+${startTime}/TB`},
            });

            // Chromakey if needed
            if (chromakey) {
                // const chromakeyStream = this.getNewVideoStream();
                filtersToAdd.push({
                    filter: 'colorkey',
                    inputs: this.currentVideoStream,
                    outputs: this.getNewVideoStream(),
                    options: {
                        color: '0x00FF00',
                        similarity: 0.1,
                        blend: 0.1,
                    },
                });
            }

            // Padding if needed
            if (padding) {
                filtersToAdd.push({
                    filter: 'pad',
                    inputs: this.currentVideoStream,
                    outputs: this.getNewVideoStream(),
                    options: {
                        width: `iw+${padding * 2}`,
                        height: `ih+${padding * 2}`,
                        x: padding,
                        y: padding,
                        color: 'black@0',
                    },
                });
            }

            // Crop overlay to duration
            filtersToAdd.push({
                filter: 'trim',
                inputs: this.currentVideoStream,
                outputs: this.getNewVideoStream(),
                options: {start: 0, end: duration},
            });

            // Overlay filter with enable for time range
            filtersToAdd.push({
                filter: 'overlay',
                inputs: [baseVideoStream, this.currentVideoStream],
                outputs: this.getNewVideoStream(),
                options: {
                    x: '(W-w)/2',
                    y: '(H-h)/2',
                    enable: `between(t,${startTime},${startTime + duration})`,
                },
            });

            // adelay overlay audio to startTime (ms)
            filtersToAdd.push({
                filter: 'adelay',
                inputs: overlayAudioStream,
                outputs: this.getNewAudioStream(),
                options: {delays: `${Math.floor(startTime * 1000)}`},
            });

            // trim overlay audio to duration
            const atrimAudioStreamInput = this.currentAudioStream;
            const atrimStream = this.getNewAudioStream();
            filtersToAdd.push({
                filter: 'atrim',
                inputs: atrimAudioStreamInput,
                outputs: atrimStream,
                options: {start: 0, end: duration},
            });

            if (audioMode === 'mix') {
                filtersToAdd.push({
                    filter: 'amix',
                    inputs: [baseAudioStream, this.currentAudioStream],
                    outputs: this.getNewAudioStream(),
                    options: {
                        inputs: 2,
                        duration: 'longest',
                        // TODO: add volume control here in future
                    },
                });
            } else if (audioMode === 'replace') {
                const baseAudioMasked = this.getNewAudioStream();
                const overlayAudioMasked = this.getNewAudioStream();
                filtersToAdd.push(
                    {
                        filter: 'volume',
                        inputs: baseAudioStream,
                        outputs: baseAudioMasked,
                        options: {
                            enable: `not(between(t,${startTime},${startTime + duration}))`,
                            volume: 1,
                        },
                    },
                    {
                        filter: 'volume',
                        inputs: atrimStream,
                        outputs: overlayAudioMasked,
                        options: {
                            enable: `between(t,${startTime},${startTime + duration})`,
                            volume: 1,
                        },
                    },
                    {
                        filter: 'amix',
                        inputs: [baseAudioMasked, overlayAudioMasked],
                        outputs: this.getNewAudioStream(),
                        options: {
                            inputs: 2,
                            duration: 'longest',
                        },
                    },
                );
            }

            // Comments for future: volume control can be added to amix or volume filters above

            log('overlayWith finished', {filtersToAdd});
            return filtersToAdd;
        });
    }

    /**
     * Trims the video and audio streams to the specified start and end times.
     *
     * @param start Start time in seconds (must be >= 0)
     * @param end End time in seconds (must be > start)
     * @returns VideoPipeline instance for chaining
     */
    trimVideo(start: number, end: number): VideoPipeline {
        if (typeof start !== 'number' || start < 0) {
            throw new Error('trimVideo: start must be a number >= 0');
        }
        if (typeof end !== 'number' || end <= start) {
            throw new Error('trimVideo: end must be a number > start');
        }

        return this.wrap(() => {
            const filtersToAdd: ComplexFilter[] = [];

            // Update compound duration calculation
            if (this.compoundDuration !== undefined) {
                this.compoundDuration = Math.min(this.compoundDuration, end - start);
            }

            // 1. Apply trim filter to video stream
            const videoInput = this.currentVideoStream;
            const videoTrimmed = this.getNewVideoStream();
            filtersToAdd.push({
                filter: 'trim',
                inputs: videoInput,
                outputs: videoTrimmed,
                options: {
                    start,
                    end,
                },
            });

            // 2. Reset video timestamps with setpts
            const videoPtsReset = this.getNewVideoStream();
            filtersToAdd.push({
                filter: 'setpts',
                inputs: videoTrimmed,
                outputs: videoPtsReset,
                options: {
                    expr: 'PTS-STARTPTS',
                },
            });

            // 3. Apply atrim filter to audio stream if audio exists
            if (this.hasAudio) {
                const audioInput = this.currentAudioStream;
                const audioTrimmed = this.getNewAudioStream();
                filtersToAdd.push({
                    filter: 'atrim',
                    inputs: audioInput,
                    outputs: audioTrimmed,
                    options: {
                        start,
                        end,
                    },
                });

                // 4. Reset audio timestamps with asetpts
                const audioPtsReset = this.getNewAudioStream();
                filtersToAdd.push({
                    filter: 'asetpts',
                    inputs: audioTrimmed,
                    outputs: audioPtsReset,
                    options: {
                        expr: 'PTS-STARTPTS',
                    },
                });
            }

            if (process.env.ENABLE_PROGRESS === 'true') {
                log('trimVideo finished', {filtersToAdd});
            }

            return filtersToAdd;
        });
    }

    /**
     * Применяет цветокоррекцию к видеопотоку (brightness, contrast, saturation, gamma)
     * @param options параметры цветокоррекции
     * @returns this (для чейнинга)
     * @throws Error если параметры вне диапазона или не числа
     */
    colorCorrect(options?: ColorCorrectionOptions): VideoPipeline {
        log('colorCorrect started');
        const {brightness = 0, contrast = 1, saturation = 1, gamma = 1} = options || {};
        // Валидация диапазонов и типов
        if (typeof brightness !== 'number' || brightness < -1.0 || brightness > 1.0) {
            throw new Error('colorCorrect: brightness должен быть числом от -1.0 до 1.0');
        }
        if (typeof contrast !== 'number' || contrast < 0.0 || contrast > 3.0) {
            throw new Error('colorCorrect: contrast должен быть числом от 0.0 до 3.0');
        }
        if (typeof saturation !== 'number' || saturation < 0.0 || saturation > 3.0) {
            throw new Error('colorCorrect: saturation должен быть числом от 0.0 до 3.0');
        }
        if (typeof gamma !== 'number' || gamma < 0.1 || gamma > 3.0) {
            throw new Error('colorCorrect: gamma должен быть числом от 0.1 до 3.0');
        }
        // Если все параметры по умолчанию — не добавляем фильтр
        if (brightness === 0 && contrast === 1 && saturation === 1 && gamma === 1) {
            return this;
        }
        return this.wrap(() => {
            const inputLabel = this.currentVideoStream;
            const outputLabel = this.getNewVideoStream();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const eqOptions: Record<string, any> = {};
            if (brightness !== 0) eqOptions.brightness = brightness;
            if (contrast !== 1) eqOptions.contrast = contrast;
            if (saturation !== 1) eqOptions.saturation = saturation;
            if (gamma !== 1) eqOptions.gamma = gamma;
            const filter: ComplexFilter = {
                filter: 'eq',
                inputs: inputLabel,
                outputs: outputLabel,
                options: eqOptions,
            };
            return [filter];
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
