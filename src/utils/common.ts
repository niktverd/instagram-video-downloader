import {existsSync, mkdirSync, writeFileSync} from 'fs';
import {join} from 'path';

import {Timestamp, collection, doc, getDoc} from 'firebase/firestore/lite';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import ffmpeg from 'fluent-ffmpeg';
import {shuffle} from 'lodash';

import {firestore, storage} from '../config/firebase';
import baseHashtags from '../config/instagram.hashtags.json';
import {postText} from '../config/post.text';
import {Collection, DelayS} from '../constants';
import {getScenarios} from '../sections/shared/scenarios';
import {MediaPostModel, SourceV3} from '../types';

import {log, logError} from './logging';

import {CreateSourceParams} from '#src/db';
import {IScenario} from '#src/models/types';

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type UploadFileFromUrlArgs = {
    url: string;
    fileName: string;
};

export async function uploadFileFromUrl({url, fileName}: UploadFileFromUrlArgs) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            responseType: 'arraybuffer',
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } as any);

        const fileBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || undefined;

        const fileRef = ref(storage, `${fileName}-${Math.random()}.mp4`);

        const metadata = {contentType};
        await uploadBytes(fileRef, fileBuffer, metadata);

        const downloadURL = await getDownloadURL(fileRef);

        return downloadURL;
    } catch (error) {
        log('Ошибка при загрузке файла:', error);
        throw error;
    }
}

export const getBufferVideo = async (url: string) => {
    const response = await fetch(url, {
        method: 'GET',
        responseType: 'arraybuffer',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    const fileBuffer1 = await response.arrayBuffer();
    return Buffer.from(fileBuffer1);
};

export const saveFileToDisk = async (url: string, filePath: string) => {
    log('saveFileToDisk', {url});
    const response = await fetch(url, {
        method: 'GET',
        responseType: 'arraybuffer',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    const fileBuffer = await response.arrayBuffer();
    writeFileSync(filePath, Buffer.from(fileBuffer));

    return filePath;
};

export const processAndConcatVideos = async (
    firstVideoPath: string,
    secondVideoPath: string,
    outputFilePath: string,
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const tempFilePath = 'temp.mp4';

        ffmpeg()
            .input(firstVideoPath)
            .output(tempFilePath)
            .videoCodec('libx265')
            .videoFilters(
                'scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1',
            )
            .on('start', (commandLine) => {
                log(1, 'FFmpeg command: ' + commandLine);
            })
            .on('stderr', (stderrLine) => {
                logError(1, 'FFmpeg stderr:', stderrLine);
            })
            .on('error', (err) => {
                logError(1, 'Ошибка при обработке видео:', err);
            })
            .on('end', () => {
                ffmpeg()
                    .input(tempFilePath)
                    .input(secondVideoPath)
                    .complexFilter([
                        // Подготовка видео: приведение каждого видео к одному формату (если нужно)
                        // '[0:v]scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1[v0]',
                        '[1:v]scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1[v1]',
                        // Конкатенация двух видео
                        '[v0][0:a][v1][1:a]concat=n=2:v=1:a=1[outv][outa]',
                    ])
                    .outputOptions('-map [outv]') // Используем видеопоток из фильтра
                    .outputOptions('-map [outa]') // Используем аудиопоток из фильтра
                    .outputOptions('-movflags +faststart')
                    // .videoBitrate('500k') // Уменьшение битрейта видео
                    // .audioBitrate('128k') // Уменьшение битрейта аудио
                    // .videoCodec('libx265')
                    .output(outputFilePath) // Указываем выходной файл
                    .on('start', (commandLine) => {
                        log(2, 'FFmpeg command: ' + commandLine);
                    })
                    .on('stderr', (stderrLine) => {
                        logError(2, 'FFmpeg stderr:', stderrLine);
                    })
                    .on('error', (err) => {
                        logError(2, 'Ошибка при обработке видео:', err);
                        reject(err);
                    })
                    .on('end', () => {
                        log(2, 'Обработка и склейка видео завершены.');
                        resolve();
                    })
                    .run();
            })
            .run();
    });
};

type PreparePostTextArgs = {
    originalHashtags: string[];
    system: string;
    account: string;
};

export const preparePostText = ({originalHashtags, system = '', account}: PreparePostTextArgs) => {
    const autoHashtags = shuffle(baseHashtags.auto).slice(0, 3);
    const partsHashtags = shuffle(baseHashtags.parts).slice(0, 3);
    const gasolineHashtags = shuffle(baseHashtags.gasoline).slice(0, 3);
    const finalText = postText.replace(
        '{popular-hashtags}',
        [...autoHashtags, ...partsHashtags, ...gasolineHashtags].join(' '),
    );
    log({finalText, originalHashtags});

    const caption = finalText
        .replace('{account}', account)
        .replace('{original-hashtags}', originalHashtags.join(' '))
        .trim();
    if (system?.length) {
        return `${caption} \n---\n${system}`;
    }
    return caption;
};

type PreparePostTextFromScenarioArgs = PreparePostTextArgs & {
    title: string;
};

export const preparePostTextFromScenario = ({
    title,
    originalHashtags,
    system = '',
    account,
}: PreparePostTextFromScenarioArgs) => {
    // const autoHashtags = shuffle(baseHashtags.auto).slice(0, 3);
    // const partsHashtags = shuffle(baseHashtags.parts).slice(0, 3);
    // const gasolineHashtags = shuffle(baseHashtags.gasoline).slice(0, 3);
    const casionHashtags = shuffle(baseHashtags.casino).slice(0, 9);
    const finalText = [
        title,
        '\n\n',
        // [...autoHashtags, ...partsHashtags, ...gasolineHashtags].join(' '),
        casionHashtags.join(' '),
        '\n\n',
        `@${account}`,
        '\n\n',
        shuffle(originalHashtags).slice(0, 10).join(' '),
    ].join('');

    log({finalText, originalHashtags});

    if (system?.length) {
        return `${finalText} \n---\n${system}`;
    }
    return finalText;
};

export const initiateRecord = (source: MediaPostModel['sources']) =>
    ({
        createdAt: new Timestamp(new Date().getTime() / 1000, 0),
        firebaseUrl: '',
        sources: source,
        publishedOnInstagramCarcarKz: {
            status: 'empty',
            mediaContainerId: '',
            published: false,
        },
        publishedOnInstagramCarcarTech: {
            status: 'empty',
            mediaContainerId: '',
            published: false,
        },
        publishedOnYoutubeCarcentreKz: {
            published: false,
            videoId: '',
        },
        attempt: 0,
        randomIndex: Math.random(),
    } as Omit<MediaPostModel, 'id'>);

export const initiateRecordV3 = async (
    source: SourceV3['sources'],
    bodyJSONString: SourceV3['bodyJSONString'],
    sender: SourceV3['sender'],
    recipient: SourceV3['recipient'],
): Promise<CreateSourceParams> => {
    const scenarios = await getScenarios(true);
    log({scenarios});
    return {
        firebaseUrl: '',
        sources: source,
        bodyJSONString,
        attempt: 0,
        lastUsed: new Date('1970-01-01').toISOString(),
        sender,
        recipient,
    };
};

export const isTimeToPublishInstagram = async () => {
    const systemCollectionRef = collection(firestore, Collection.System);
    const scheduleDocRef = doc(systemCollectionRef, 'schedule');
    const scheduleSnap = await getDoc(scheduleDocRef);
    if (scheduleSnap.exists()) {
        const schedule = scheduleSnap.data();
        const now = new Date().getTime() / 1000;
        const diff = now - schedule.lastPublishingTime.seconds;
        log({schedule, now, diff, delay: DelayS.Min5});

        if (diff < DelayS.Min5) {
            throw new Error('It is to early to publish container');
        }
    }
};

export const getInstagramPropertyName = (tokenObjectId: string) =>
    tokenObjectId === 'carcar.kz'
        ? 'publishedOnInstagramCarcarKz'
        : 'publishedOnInstagramCarcarTech';

export const getWorkingDirectoryForVideo = (directoryName: string) => {
    const basePath = join(process.cwd(), 'videos-working-directory', directoryName + Math.random());
    if (!existsSync(basePath)) {
        mkdirSync(basePath, {recursive: true});
    }

    return basePath;
};

export const getRandomElementOfArray = <T>(array: T[]) => {
    return array[Math.floor(Math.random() * array.length)];
};

export const prepareCaption = (texts: IScenario['texts'] | undefined) => {
    const linkToAnotherAccount = shuffle(texts?.linkToAnotherAccount || [''])[0];
    const intro = shuffle(texts?.intro || [''])[0];
    const main = shuffle(texts?.main || [''])[0];
    const outro = shuffle(texts?.outro || [''])[0];

    return [linkToAnotherAccount, intro, main, outro].filter(Boolean).join('\n');
};
