import {existsSync, mkdirSync, unlinkSync} from 'fs';
import path from 'path';

import {log, saveFileToDisk} from '#utils';
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
    const runOverlayWith = true;
    if (runOverlayWith) {
        await runOverlayWithTests();
    }
    log('runOptimizedDemoTests finished');
};

runOptimizedDemoTests();
