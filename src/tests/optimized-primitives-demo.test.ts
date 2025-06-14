import {existsSync, mkdirSync, unlinkSync} from 'fs';
import path from 'path';

import {log, saveFileToDisk} from '#utils';
import {getVideoDuration} from '$/cloud-run/components/video/ffprobe.helpers';
import {VideoPipeline} from '$/cloud-run/components/video/primitives-optimized';

const testUrl =
    'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/04cJDG354H7mvpVtL3It.mp4?alt=media&token=da780902-65e8-48c4-85b0-3d15777b0857';
const basePath = path.join(__dirname, 'tests-data');
const inputFile = path.join(basePath, 'optimized-demo-input.mp4');
const outputFile = path.join(basePath, 'optimized-demo-output-2.mp4');

const sources: Record<string, string> = {
    blackNYellow:
        'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/04cJDG354H7mvpVtL3It.mp4?alt=media&token=da780902-65e8-48c4-85b0-3d15777b0857',
    blackNRed:
        'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/0CGS01BX79mnmrvlMuNJ.mp4?alt=media&token=375facb9-9cdd-4549-978f-b209780c93fa',
    orange: 'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/0KqzwyzP5jzrsXEjiEHd.mp4?alt=media&token=72438526-30a1-4a7d-a318-3ffe45f1a5ff',
    green: 'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/1303Ew4U2hhrVAfYLOvg.mp4?alt=media&token=a5c7764d-6b6d-4f90-8841-826c5df06a62',
    silent: 'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/assets%2Ftests-green%2F1xbet%201.mp4?alt=media&token=2682116c-4834-4141-ae88-1f85f41a4879',
};

const prepareVideo = async () => {
    if (!existsSync(basePath)) {
        mkdirSync(basePath, {recursive: true});
    }
    if (!existsSync(inputFile)) {
        log('Downloading test video...');
        await saveFileToDisk(testUrl, inputFile);
    }
    return inputFile;
};

const testOptimizedPipeline = async (filePath: string) => {
    log('testOptimizedPipeline started');
    if (existsSync(outputFile)) {
        unlinkSync(outputFile);
    }

    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(filePath);
    pipeline.makeItRed();
    pipeline.rotate(2);
    console.log(pipeline.complexFilters);
    await pipeline.run(outputFile);

    if (!existsSync(outputFile)) {
        throw new Error('Output file was not created');
    }
    log('testOptimizedPipeline completed, output exists:', outputFile);
};

async function prepareMultipleVideos(names: string[]): Promise<string[]> {
    if (!existsSync(basePath)) {
        mkdirSync(basePath, {recursive: true});
    }
    const files: string[] = [];
    for (const name of names) {
        const url = sources[name];
        if (!url) throw new Error(`No source for ${name}`);
        const filePath = path.join(basePath, `concat-input-${name}.mp4`);
        if (!existsSync(filePath)) {
            log(`Downloading test video for ${name}...`);
            await saveFileToDisk(url, filePath);
        }
        files.push(filePath);
    }
    return files;
}

const concatOutputFile = path.join(basePath, 'optimized-demo-concat-output.mp4');

const testConcatPipeline = async (filePaths: string[]) => {
    log('testConcatPipeline started');
    if (existsSync(concatOutputFile)) {
        unlinkSync(concatOutputFile);
    }
    // Создаём пайплайны для каждого файла
    const pipelines = await Promise.all(
        filePaths.map(async (file) => {
            const p = new VideoPipeline({width: 720, height: 1280});
            await p.init(file);
            return p;
        }),
    );
    // Конкатенируем через master.concat(...)
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(filePaths[0]);
    for (let i = 1; i < pipelines.length; i++) {
        master.concat(pipelines[i]);
        break;
    }
    await master.run(concatOutputFile);
    if (!existsSync(concatOutputFile)) {
        throw new Error('Concat output file was not created');
    }
    log('testConcatPipeline completed, output exists:', concatOutputFile);
};
const testConcatThemselvesPipelineTests = async (filePath: string) => {
    log('testConcatPipeline started');
    if (existsSync(concatOutputFile)) {
        unlinkSync(concatOutputFile);
    }
    // Создаём пайплайны для каждого файла
    const pipeline = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await pipeline.init(filePath);

    for (let i = 1; i < 3; i++) {
        pipeline.concat(pipeline);
        break;
    }

    await pipeline.run(concatOutputFile);

    if (!existsSync(concatOutputFile)) {
        throw new Error('Concat output file was not created');
    }
    log('testConcatPipeline completed, output exists:', concatOutputFile);
};

const testConcatWithFilterPipeline = async (filePaths: string[]) => {
    log('testConcatWithFilterPipeline started');
    const output = path.join(basePath, 'optimized-demo-concat-filter-output.mp4');
    if (existsSync(output)) {
        unlinkSync(output);
    }
    // Создаём пайплайны для каждого файла
    const pipelines = await Promise.all(
        filePaths.map(async (file) => {
            const p = new VideoPipeline({width: 720, height: 1280});
            await p.init(file);
            return p;
        }),
    );
    // Конкатенируем через master.concat(...)
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(filePaths[0]);
    for (let i = 1; i < pipelines.length; i++) {
        master.concat(pipelines[i]);
    }
    // Применяем фильтр к итоговому видео
    master.makeItRed();
    master.rotate(11);
    master.rotate(35);
    await master.run(output);
    if (!existsSync(output)) {
        throw new Error('Concat+filter output file was not created');
    }
    log('testConcatWithFilterPipeline completed, output exists:', output);
};

// const _testConcatOnNonMaster = async (filePaths: string[]) => {
//     log('testConcatOnNonMaster started');
//     // Создаём пайплайны для каждого файла
//     const pipelines = await Promise.all(
//         filePaths.map(async (file) => {
//             const p = new VideoPipeline();
//             await p.init(file);
//             return p;
//         }),
//     );
//     // Пробуем вызвать concat на не-мастер пайплайне
//     let errorCaught = false;
//     try {
//         pipelines[1].concat(pipelines[0]);
//     } catch (e) {
//         errorCaught = true;
//         const err = e as Error;
//         log('Caught expected error:', err.message);
//     }
//     if (!errorCaught) {
//         throw new Error('Expected error when calling concat on non-master pipeline');
//     }
//     log('testConcatOnNonMaster completed, error thrown as expected');
// };

const testRunSingleAndMultiInput = async (filePaths: string[]) => {
    log('testRunSingleAndMultiInput started');
    // Single input
    const singleOutput = path.join(basePath, 'optimized-demo-single-output.mp4');
    if (existsSync(singleOutput)) {
        unlinkSync(singleOutput);
    }
    const single = new VideoPipeline({width: 720, height: 1280});
    await single.init(filePaths[0]);
    await single.run(singleOutput);
    if (!existsSync(singleOutput)) {
        throw new Error('Single input output file was not created');
    }
    log('testRunSingleAndMultiInput: single input OK');
    // Multi input (concat)
    const multiOutput = path.join(basePath, 'optimized-demo-multi-output.mp4');
    if (existsSync(multiOutput)) {
        unlinkSync(multiOutput);
    }
    const pipelines = await Promise.all(
        filePaths.map(async (file) => {
            const p = new VideoPipeline({width: 720, height: 1280});
            await p.init(file);
            return p;
        }),
    );
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(filePaths[0]);
    for (let i = 1; i < pipelines.length; i++) {
        master.concat(pipelines[i]);
    }
    await master.run(multiOutput);
    if (!existsSync(multiOutput)) {
        throw new Error('Multi input output file was not created');
    }
    log('testRunSingleAndMultiInput: multi input OK');
};

const testConcatWithFilterAndSilentPipeline = async (filePaths: string[]) => {
    log('testConcatWithFilterAndSilentPipeline started');
    const output = path.join(basePath, 'optimized-demo-concat-filter-silent-output.mp4');
    if (existsSync(output)) {
        unlinkSync(output);
    }
    const pipelines = await Promise.all(
        filePaths.map(async (file) => {
            const p = new VideoPipeline({width: 720, height: 1280});
            await p.init(file);
            return p;
        }),
    );
    // Создаем master pipeline
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(filePaths[0]);
    for (let i = 1; i < pipelines.length; i++) {
        master.concat(pipelines[i]);
    }
    master.makeItRed();
    await master.run(output);
    if (!existsSync(output)) {
        throw new Error('Concat+filter+silent output file was not created');
    }
    log('testConcatWithFilterAndSilentPipeline completed, output exists:', output);
};

// === overlayWith tests ===
const overlayOutputFile = path.join(basePath, 'optimized-demo-overlay-output.mp4');
const overlayChromaOutputFile = path.join(basePath, 'optimized-demo-overlay-chroma-output.mp4');
const overlayPadOutputFile = path.join(basePath, 'optimized-demo-overlay-pad-output.mp4');
const overlayAudioMixOutputFile = path.join(basePath, 'optimized-demo-overlay-audiomix-output.mp4');
const overlayAudioReplaceOutputFile = path.join(
    basePath,
    'optimized-demo-overlay-audioreplace-output.mp4',
);
const overlayNoAudioOutputFile = path.join(basePath, 'optimized-demo-overlay-noaudio-output.mp4');

const testOverlayWithBasic = async () => {
    log('testOverlayWithBasic started');
    if (existsSync(overlayOutputFile)) unlinkSync(overlayOutputFile);
    const [base, overlay] = await prepareMultipleVideos(['blackNYellow', 'silent']);
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(base);
    const overlayPipe = new VideoPipeline({width: 720, height: 1280});
    await overlayPipe.init(overlay);
    master.overlayWith(overlayPipe, {startTime: 1, duration: 2});
    await master.run(overlayOutputFile);
    if (!existsSync(overlayOutputFile)) throw new Error('Overlay output not created');
    log('testOverlayWithBasic done');
};

const testOverlayWithChromakey = async () => {
    log('testOverlayWithChromakey started');
    if (existsSync(overlayChromaOutputFile)) unlinkSync(overlayChromaOutputFile);
    const [base, overlay] = await prepareMultipleVideos(['blackNYellow', 'silent']);
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(base);
    const overlayPipe = new VideoPipeline({width: 720, height: 1280});
    await overlayPipe.init(overlay);
    master.overlayWith(overlayPipe, {startTime: 0.5, duration: 2, chromakey: true});
    await master.run(overlayChromaOutputFile);
    if (!existsSync(overlayChromaOutputFile))
        throw new Error('Overlay chromakey output not created');
    log('testOverlayWithChromakey done');
};

const testOverlayWithPadding = async () => {
    log('testOverlayWithPadding started');
    if (existsSync(overlayPadOutputFile)) unlinkSync(overlayPadOutputFile);
    const [base, overlay] = await prepareMultipleVideos(['blackNYellow', 'silent']);
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(base);
    const overlayPipe = new VideoPipeline({width: 720, height: 1280});
    await overlayPipe.init(overlay);
    master.overlayWith(overlayPipe, {startTime: 0, duration: 2, padding: 40});
    await master.run(overlayPadOutputFile);
    if (!existsSync(overlayPadOutputFile)) throw new Error('Overlay pad output not created');
    log('testOverlayWithPadding done');
};

const testOverlayWithAudioMix = async () => {
    log('testOverlayWithAudioMix started');
    if (existsSync(overlayAudioMixOutputFile)) unlinkSync(overlayAudioMixOutputFile);
    const [base, overlay] = await prepareMultipleVideos(['blackNYellow', 'silent']);
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(base);
    const overlayPipe = new VideoPipeline({width: 720, height: 1280});
    await overlayPipe.init(overlay);
    master.overlayWith(overlayPipe, {startTime: 0, duration: 2, audioMode: 'mix'});
    await master.run(overlayAudioMixOutputFile);
    if (!existsSync(overlayAudioMixOutputFile))
        throw new Error('Overlay audio mix output not created');
    log('testOverlayWithAudioMix done');
};

const testOverlayWithAudioReplace = async () => {
    log('testOverlayWithAudioReplace started');
    if (existsSync(overlayAudioReplaceOutputFile)) unlinkSync(overlayAudioReplaceOutputFile);
    const [base, overlay] = await prepareMultipleVideos(['blackNYellow', 'silent']);
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(base);
    const overlayPipe = new VideoPipeline({width: 720, height: 1280});
    await overlayPipe.init(overlay);
    master.overlayWith(overlayPipe, {startTime: 0, duration: 2, audioMode: 'replace'});
    await master.run(overlayAudioReplaceOutputFile);
    if (!existsSync(overlayAudioReplaceOutputFile))
        throw new Error('Overlay audio replace output not created');
    log('testOverlayWithAudioReplace done');
};

const testOverlayWithNoAudio = async () => {
    log('testOverlayWithNoAudio started');
    if (existsSync(overlayNoAudioOutputFile)) unlinkSync(overlayNoAudioOutputFile);
    const [base, overlay] = await prepareMultipleVideos(['blackNYellow', 'silent']);
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(base);
    const overlayPipe = new VideoPipeline({width: 720, height: 1280});
    await overlayPipe.init(overlay);
    master.overlayWith(overlayPipe, {startTime: 0, duration: 2});
    await master.run(overlayNoAudioOutputFile);
    if (!existsSync(overlayNoAudioOutputFile))
        throw new Error('Overlay no audio output not created');
    log('testOverlayWithNoAudio done');
};

const testOverlayWithChaining = async () => {
    log('testOverlayWithChaining started');
    const output = path.join(basePath, 'optimized-demo-overlay-chaining-output.mp4');
    if (existsSync(output)) unlinkSync(output);
    const [base, overlay] = await prepareMultipleVideos(['blackNYellow', 'silent']);
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(base);
    const overlayPipe = new VideoPipeline({width: 720, height: 1280});
    await overlayPipe.init(overlay);
    master.overlayWith(overlayPipe, {startTime: 0, duration: 2});
    master.rotate(10);
    master.makeItRed();
    await master.run(output);
    if (!existsSync(output)) throw new Error('Overlay chaining output not created');
    log('testOverlayWithChaining done');
};

const testOverlayWithInvalidParams = async () => {
    log('testOverlayWithInvalidParams started');
    const [base, overlay] = await prepareMultipleVideos(['blackNYellow', 'silent']);
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(base);
    const overlayPipe = new VideoPipeline({width: 720, height: 1280});
    await overlayPipe.init(overlay);
    let errorCaught = false;
    try {
        master.overlayWith(overlayPipe, {startTime: -1, duration: 2});
    } catch (e) {
        errorCaught = true;
        log('Caught expected error:', (e as Error).message);
    }
    if (!errorCaught) throw new Error('Expected error for invalid startTime');
    log('testOverlayWithInvalidParams done');
};

const runOverlayWithTests = async () => {
    await testOverlayWithBasic();
    await testOverlayWithChromakey();
    await testOverlayWithPadding();
    await testOverlayWithAudioMix();
    await testOverlayWithAudioReplace();
    await testOverlayWithNoAudio();
    await testOverlayWithChaining();
    await testOverlayWithInvalidParams();
    log('runOverlayWithTests finished');
};

// === trimVideo integration tests ===

const testTrimVideoSmoke = async () => {
    log('testTrimVideoSmoke started');
    const output = path.join(basePath, 'optimized-demo-trim-smoke.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    // Обрезаем с 1 до 4 секунды
    pipeline.trimVideo(1, 4);
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('Trim output file was not created');
    const duration = await getVideoDuration(output);
    if (duration < 2.8 || duration > 3.3)
        throw new Error(`Trimmed duration not in expected range: ${duration}`);
    log('testTrimVideoSmoke done', {duration});
};

const testTrimVideoEdge = async () => {
    log('testTrimVideoEdge started');
    const output = path.join(basePath, 'optimized-demo-trim-edge.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const origDuration = await getVideoDuration(file);
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    // Обрезаем с 0 до origDuration (должно быть почти без изменений)
    pipeline.trimVideo(0, origDuration);
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('Trim edge output file was not created');
    const duration = await getVideoDuration(output);
    if (Math.abs(duration - origDuration) > 0.5)
        throw new Error(`Edge trim duration mismatch: ${duration} vs ${origDuration}`);
    log('testTrimVideoEdge done', {duration});
};

const testTrimVideoError = async () => {
    log('testTrimVideoError started');
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    let errorCaught = false;
    try {
        pipeline.trimVideo(-1, 5);
    } catch (e) {
        errorCaught = true;
        log('Caught expected error (start<0):', (e as Error).message);
    }
    if (!errorCaught) throw new Error('Expected error for start<0');
    errorCaught = false;
    try {
        pipeline.trimVideo(5, 5);
    } catch (e) {
        errorCaught = true;
        log('Caught expected error (end<=start):', (e as Error).message);
    }
    if (!errorCaught) throw new Error('Expected error for end<=start');
    log('testTrimVideoError done');
};

const testTrimVideoChain = async () => {
    log('testTrimVideoChain started');
    const output = path.join(basePath, 'optimized-demo-trim-chain.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.trimVideo(1, 4).makeItRed().rotate(10);
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('Trim+chain output file was not created');
    const duration = await getVideoDuration(output);
    if (duration < 2.8 || duration > 3.3)
        throw new Error(`Trim+chain duration not in expected range: ${duration}`);
    log('testTrimVideoChain done', {duration});
};

// === colorCorrect integration tests ===
const testColorCorrectSmoke = async () => {
    log('testColorCorrectSmoke started');
    const output = path.join(basePath, 'optimized-demo-colorcorrect-smoke.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.colorCorrect({brightness: 0.2});
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('ColorCorrect smoke output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testColorCorrectSmoke done', {duration});
};

const testColorCorrectAllParams = async () => {
    log('testColorCorrectAllParams started');
    const output = path.join(basePath, 'optimized-demo-colorcorrect-allparams.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.colorCorrect({brightness: 0.5, contrast: 2, saturation: 2, gamma: 2});
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('ColorCorrect allparams output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testColorCorrectAllParams done', {duration});
};

const testColorCorrectEdgeCases = async () => {
    log('testColorCorrectEdgeCases started');
    const output = path.join(basePath, 'optimized-demo-colorcorrect-edge.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.colorCorrect({brightness: -1, contrast: 0, saturation: 0, gamma: 0.1});
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('ColorCorrect edge output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testColorCorrectEdgeCases done', {duration});
};

const testColorCorrectErrorCases = async () => {
    log('testColorCorrectErrorCases started');
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    let errorCaught = false;
    try {
        pipeline.colorCorrect({brightness: -2});
    } catch (e) {
        errorCaught = true;
        log('Caught expected error (brightness)', (e as Error).message);
    }
    if (!errorCaught) throw new Error('Expected error for brightness < -1');
    errorCaught = false;
    try {
        pipeline.colorCorrect({contrast: 4});
    } catch (e) {
        errorCaught = true;
        log('Caught expected error (contrast)', (e as Error).message);
    }
    if (!errorCaught) throw new Error('Expected error for contrast > 3');
    errorCaught = false;
    try {
        pipeline.colorCorrect({saturation: -1});
    } catch (e) {
        errorCaught = true;
        log('Caught expected error (saturation)', (e as Error).message);
    }
    if (!errorCaught) throw new Error('Expected error for saturation < 0');
    errorCaught = false;
    try {
        pipeline.colorCorrect({gamma: 0});
    } catch (e) {
        errorCaught = true;
        log('Caught expected error (gamma)', (e as Error).message);
    }
    if (!errorCaught) throw new Error('Expected error for gamma < 0.1');
    log('testColorCorrectErrorCases done');
};

const testColorCorrectChaining = async () => {
    log('testColorCorrectChaining started');
    const output = path.join(basePath, 'optimized-demo-colorcorrect-chain.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.colorCorrect({brightness: 0.3}).makeItRed().rotate(10);
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('ColorCorrect chain output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testColorCorrectChaining done', {duration});
};

const testColorCorrectDefaultValues = async () => {
    log('testColorCorrectDefaultValues started');
    const output = path.join(basePath, 'optimized-demo-colorcorrect-default.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.colorCorrect(); // все значения по умолчанию
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('ColorCorrect default output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testColorCorrectDefaultValues done', {duration});
};

const runColorCorrectTests = async () => {
    await testColorCorrectSmoke();
    await testColorCorrectAllParams();
    await testColorCorrectEdgeCases();
    await testColorCorrectErrorCases();
    await testColorCorrectChaining();
    await testColorCorrectDefaultValues();
    log('runColorCorrectTests finished');
};

const testChangeSpeedBasic = async () => {
    log('testChangeSpeedBasic started');
    const output = path.join(basePath, 'optimized-demo-changespeed-basic.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.changeSpeed(1.5);
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('ChangeSpeed basic output not created');
    const duration = await getVideoDuration(output);
    if (duration < 6.5 || duration > 7.5)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testChangeSpeedBasic done', {duration});
};

const testChangeSpeedEdge05 = async () => {
    log('testChangeSpeedEdge05 started');
    const output = path.join(basePath, 'optimized-demo-changespeed-edge-05.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.changeSpeed(0.5);
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('ChangeSpeed edge 0.5 output not created');
    const duration = await getVideoDuration(output);
    if (duration < 20.5 || duration > 21.5)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testChangeSpeedEdge05 done', {duration});
};

const testChangeSpeedEdge20 = async () => {
    log('testChangeSpeedEdge20 started');
    const output = path.join(basePath, 'optimized-demo-changespeed-edge-20.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.changeSpeed(2.0);
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('ChangeSpeed edge 2.0 output not created');
    const duration = await getVideoDuration(output);
    if (duration < 0.5 || duration > 5.5)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testChangeSpeedEdge20 done', {duration});
};

const testChangeSpeedNoChange = async () => {
    log('testChangeSpeedNoChange started');
    const output = path.join(basePath, 'optimized-demo-changespeed-nochange.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const origDuration = await getVideoDuration(file);
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.changeSpeed(1.0);
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('ChangeSpeed nochange output not created');
    const duration = await getVideoDuration(output);
    if (Math.abs(duration - origDuration) > 0.5)
        throw new Error(`NoChange: duration mismatch: ${duration} vs ${origDuration}`);
    log('testChangeSpeedNoChange done', {duration, origDuration});
};

const testChangeSpeedErrors = async () => {
    log('testChangeSpeedErrors started');
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    const invalids = [-1, 0.1, 3.0, 10.0, 'foo', null, undefined];
    for (const val of invalids) {
        let errorCaught = false;
        try {
            // @ts-expect-error: testing invalid input
            pipeline.changeSpeed(val);
        } catch (e) {
            errorCaught = true;
            log('Caught expected error for', val, ':', (e as Error).message);
        }
        if (!errorCaught) throw new Error(`Expected error for changeSpeed(${val})`);
    }
    log('testChangeSpeedErrors done');
};

const testChangeSpeedDurationTracking = async () => {
    log('testChangeSpeedDurationTracking started');
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    const orig = pipeline.compoundDuration;
    pipeline.changeSpeed(2.0);
    const expected = orig ? orig / 2.0 : undefined;
    if (
        pipeline.compoundDuration === undefined ||
        Math.abs(pipeline.compoundDuration - (expected || 0)) > 0.1
    ) {
        throw new Error(
            `compoundDuration not updated correctly: ${pipeline.compoundDuration} vs ${expected}`,
        );
    }
    log('testChangeSpeedDurationTracking done', {orig, updated: pipeline.compoundDuration});
};

const testChangeSpeedChaining = async () => {
    log('testChangeSpeedChaining started');
    const output = path.join(basePath, 'optimized-demo-changespeed-chaining.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.changeSpeed(1.5).rotate(10).colorCorrect({brightness: 0.2});
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('ChangeSpeed chaining output not created');
    const duration = await getVideoDuration(output);
    if (duration < 1.2 || duration > 7.5)
        throw new Error(`Chaining: duration not in expected range: ${duration}`);
    log('testChangeSpeedChaining done', {duration});
};

const testChangeSpeedConcat = async () => {
    log('testChangeSpeedConcat started');
    const output = path.join(basePath, 'optimized-demo-changespeed-concat.mp4');
    if (existsSync(output)) unlinkSync(output);
    const files = await prepareMultipleVideos(['blackNYellow', 'silent']);
    const pipelines = await Promise.all(
        files.map(async (file) => {
            const p = new VideoPipeline({width: 720, height: 1280});
            await p.init(file);
            p.changeSpeed(1.5);
            return p;
        }),
    );
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(files[0]);
    for (let i = 1; i < pipelines.length; i++) {
        master.concat(pipelines[i]);
    }
    await master.run(output);
    if (!existsSync(output)) throw new Error('ChangeSpeed concat output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2.0 || duration > 20.0)
        throw new Error(`Concat: duration not in expected range: ${duration}`);
    log('testChangeSpeedConcat done', {duration});
};

const testChangeSpeedOverlay = async () => {
    log('testChangeSpeedOverlay started');
    const output = path.join(basePath, 'optimized-demo-changespeed-overlay.mp4');
    if (existsSync(output)) unlinkSync(output);
    const [base, overlay] = await prepareMultipleVideos(['blackNYellow', 'silent']);
    const master = new VideoPipeline({width: 720, height: 1280, isMaster: true});
    await master.init(base);
    master.changeSpeed(1.5);
    const overlayPipe = new VideoPipeline({width: 720, height: 1280});
    await overlayPipe.init(overlay);
    overlayPipe.changeSpeed(2.0);
    master.overlayWith(overlayPipe, {startTime: 0, duration: 2});
    await master.run(output);
    if (!existsSync(output)) throw new Error('ChangeSpeed overlay output not created');
    const duration = await getVideoDuration(output);
    if (duration < 0.5 || duration > 7.5)
        throw new Error(`Overlay: duration not in expected range: ${duration}`);
    log('testChangeSpeedOverlay done', {duration});
};

const runChangeSpeedTests = async () => {
    await testChangeSpeedBasic();
    await testChangeSpeedEdge05();
    await testChangeSpeedEdge20();
    await testChangeSpeedNoChange();
    await testChangeSpeedErrors();
    await testChangeSpeedDurationTracking();
    await testChangeSpeedChaining();
    await testChangeSpeedConcat();
    await testChangeSpeedOverlay();
};

// === boxBlur integration tests ===
const testBoxBlurSmoke = async () => {
    log('testBoxBlurSmoke started');
    const output = path.join(basePath, 'optimized-demo-boxblur-smoke.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.boxBlur({boxWidth: 3, boxHeight: 3, iterations: 2});
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('BoxBlur smoke output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testBoxBlurSmoke done', {duration});
};

const testBoxBlurDefaultParams = async () => {
    log('testBoxBlurDefaultParams started');
    const output = path.join(basePath, 'optimized-demo-boxblur-default.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.boxBlur(); // все значения по умолчанию
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('BoxBlur default output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testBoxBlurDefaultParams done', {duration});
};

const testBoxBlurEdgeCases = async () => {
    log('testBoxBlurEdgeCases started');
    const output = path.join(basePath, 'optimized-demo-boxblur-edge.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.boxBlur({boxWidth: 1, boxHeight: 1, iterations: 1});
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('BoxBlur edge output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testBoxBlurEdgeCases done', {duration});
};

const testBoxBlurErrorCases = async () => {
    log('testBoxBlurErrorCases started');
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);

    // Test invalid boxWidth
    let errorCaught = false;
    try {
        pipeline.boxBlur({boxWidth: 0});
    } catch (e) {
        errorCaught = true;
        log('Caught expected error (boxWidth=0):', (e as Error).message);
    }
    if (!errorCaught) throw new Error('Expected error for boxWidth=0');

    // Test invalid boxHeight
    errorCaught = false;
    try {
        pipeline.boxBlur({boxHeight: -1});
    } catch (e) {
        errorCaught = true;
        log('Caught expected error (boxHeight=-1):', (e as Error).message);
    }
    if (!errorCaught) throw new Error('Expected error for boxHeight=-1');

    // Test invalid iterations
    errorCaught = false;
    try {
        pipeline.boxBlur({iterations: 0});
    } catch (e) {
        errorCaught = true;
        log('Caught expected error (iterations=0):', (e as Error).message);
    }
    if (!errorCaught) throw new Error('Expected error for iterations=0');

    // Test non-integer values
    errorCaught = false;
    try {
        pipeline.boxBlur({boxWidth: 2.5});
    } catch (e) {
        errorCaught = true;
        log('Caught expected error (boxWidth=2.5):', (e as Error).message);
    }
    if (!errorCaught) throw new Error('Expected error for boxWidth=2.5');

    log('testBoxBlurErrorCases done');
};

const testBoxBlurChaining = async () => {
    log('testBoxBlurChaining started');
    const output = path.join(basePath, 'optimized-demo-boxblur-chaining.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.boxBlur({boxWidth: 2, boxHeight: 2}).makeItRed().rotate(10);
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('BoxBlur chaining output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testBoxBlurChaining done', {duration});
};

// === hueAdjust integration tests ===
const testHueAdjustSmoke = async () => {
    log('testHueAdjustSmoke started');
    const output = path.join(basePath, 'optimized-demo-hueadjust-smoke.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.hueAdjust({hue: 90, saturation: 1.5});
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('HueAdjust smoke output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testHueAdjustSmoke done', {duration});
};

const testHueAdjustDefaultParams = async () => {
    log('testHueAdjustDefaultParams started');
    const output = path.join(basePath, 'optimized-demo-hueadjust-default.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.hueAdjust(); // все значения по умолчанию - должно быть no-op
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('HueAdjust default output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testHueAdjustDefaultParams done', {duration});
};

const testHueAdjustEdgeCases = async () => {
    log('testHueAdjustEdgeCases started');
    const output = path.join(basePath, 'optimized-demo-hueadjust-edge.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.hueAdjust({hue: -180, saturation: 0});
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('HueAdjust edge output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testHueAdjustEdgeCases done', {duration});
};

const testHueAdjustErrorCases = async () => {
    log('testHueAdjustErrorCases started');
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);

    // Test invalid saturation
    let errorCaught = false;
    try {
        pipeline.hueAdjust({saturation: -1});
    } catch (e) {
        errorCaught = true;
        log('Caught expected error (saturation=-1):', (e as Error).message);
    }
    if (!errorCaught) throw new Error('Expected error for saturation=-1');

    // Test NaN hue
    errorCaught = false;
    try {
        pipeline.hueAdjust({hue: NaN});
    } catch (e) {
        errorCaught = true;
        log('Caught expected error (hue=NaN):', (e as Error).message);
    }
    if (!errorCaught) throw new Error('Expected error for hue=NaN');

    log('testHueAdjustErrorCases done');
};

const testHueAdjustChaining = async () => {
    log('testHueAdjustChaining started');
    const output = path.join(basePath, 'optimized-demo-hueadjust-chaining.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.hueAdjust({hue: 45, saturation: 2}).colorCorrect({brightness: 0.2}).rotate(5);
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('HueAdjust chaining output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testHueAdjustChaining done', {duration});
};

// === Combined tests ===
const testBoxBlurHueAdjustChaining = async () => {
    log('testBoxBlurHueAdjustChaining started');
    const output = path.join(basePath, 'optimized-demo-boxblur-hueadjust-chaining.mp4');
    if (existsSync(output)) unlinkSync(output);
    const file = await prepareVideo();
    const pipeline = new VideoPipeline({width: 720, height: 1280});
    await pipeline.init(file);
    pipeline.boxBlur({boxWidth: 3, boxHeight: 3}).hueAdjust({hue: 120, saturation: 1.5});
    await pipeline.run(output);
    if (!existsSync(output)) throw new Error('BoxBlur+HueAdjust chaining output not created');
    const duration = await getVideoDuration(output);
    if (duration < 2 || duration > 20)
        throw new Error(`Duration not in expected range: ${duration}`);
    log('testBoxBlurHueAdjustChaining done', {duration});
};

const runBoxBlurHueAdjustTests = async () => {
    await testBoxBlurSmoke();
    await testBoxBlurDefaultParams();
    await testBoxBlurEdgeCases();
    await testBoxBlurErrorCases();
    await testBoxBlurChaining();

    await testHueAdjustSmoke();
    await testHueAdjustDefaultParams();
    await testHueAdjustEdgeCases();
    await testHueAdjustErrorCases();
    await testHueAdjustChaining();

    await testBoxBlurHueAdjustChaining();
    log('runBoxBlurHueAdjustTests finished');
};

const runOptimizedDemoTests = async () => {
    const runTests = true;
    if (!runTests) {
        return;
    }
    const runSingleTest = true;
    if (runSingleTest) {
        const file = await prepareVideo();
        await testOptimizedPipeline(file);
    }

    // Новый тест для concat
    const concatFiles = await prepareMultipleVideos([
        'blackNYellow',
        // 'blackNRed',
        // 'orange',
        // 'green',
        'silent',
    ]);

    const runConcatPipelineTests = false;
    if (runConcatPipelineTests) {
        await testConcatPipeline(concatFiles);
    }
    const runConcatThemselvesPipelineTests = true;
    if (runConcatThemselvesPipelineTests) {
        await testConcatThemselvesPipelineTests(concatFiles[0]);
    }

    const runConcatWithFilterTests = false;
    if (runConcatWithFilterTests) {
        // Новый тест: concat + фильтр
        await testConcatWithFilterPipeline(concatFiles);
    }

    const runRunSingleAndMultiInputTests = false;
    if (runRunSingleAndMultiInputTests) {
        // Новый тест: concat на не-мастер пайплайне
        // await testConcatOnNonMaster(concatFiles);
        // Новый тест: run с одним и несколькими входами
        await testRunSingleAndMultiInput(concatFiles);
    }
    // Новый тест: concat + фильтр + silent audio
    const runConcatWithFilterAndSilentTests = false;
    if (runConcatWithFilterAndSilentTests) {
        await testConcatWithFilterAndSilentPipeline(concatFiles);
    }
    // Новый тест: overlayWith
    const runOverlayWith = false;
    if (runOverlayWith) {
        await runOverlayWithTests();
    }

    const runTrimTests = false; // <-- включи true чтобы запускать trimVideo тесты
    if (runTrimTests) {
        await testTrimVideoSmoke();
        await testTrimVideoEdge();
        await testTrimVideoError();
        await testTrimVideoChain();
    }

    const runColorCorrectTestsFlag = false;
    if (runColorCorrectTestsFlag) {
        await runColorCorrectTests();
    }

    const runChangeSpeedTestsFlag = false;
    if (runChangeSpeedTestsFlag) {
        await runChangeSpeedTests();
    }

    const runBoxBlurHueAdjustTestsFlag = false;
    if (runBoxBlurHueAdjustTestsFlag) {
        await runBoxBlurHueAdjustTests();
    }

    log('runOptimizedDemoTests finished');
};

runOptimizedDemoTests();
