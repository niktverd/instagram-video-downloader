import {writeFileSync} from 'fs';
import path from 'path';

import {collection, doc, updateDoc} from 'firebase/firestore/lite';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import ffmpeg from 'fluent-ffmpeg';
import {shuffle} from 'lodash';

import {firestore, storage} from './config/firebase';
import baseHashtags from './config/instagram.hashtags.json';
import {postText} from './config/post.text';

type UploadFileFromUrlArgs = {
    url: string;
    firebaseId: string;
};

export async function uploadFileFromUrl({url, firebaseId}: UploadFileFromUrlArgs) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            responseType: 'arraybuffer',
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } as any);

        const fileBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || undefined;

        const fileRef = ref(storage, `${firebaseId}.mp4`);

        const metadata = {contentType};
        await uploadBytes(fileRef, fileBuffer, metadata);

        const downloadURL = await getDownloadURL(fileRef);

        console.log('Файл успешно загружен:', downloadURL);

        const collectionRef = collection(firestore, 'media-post');
        const documentRef = doc(collectionRef, firebaseId);
        await updateDoc(documentRef, {
            firebaseUrl: downloadURL,
        });

        return downloadURL;
    } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
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

export const saveFileToDisk = async (url: string, fileName: string) => {
    const response = await fetch(url, {
        method: 'GET',
        responseType: 'arraybuffer',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    const fileBuffer = await response.arrayBuffer();
    const tempFilePath = path.join(__dirname, fileName);
    writeFileSync(tempFilePath, Buffer.from(fileBuffer));
    return tempFilePath;
};

export const processAndConcatVideos = async (
    firstVideoPath: string,
    secondVideoPath: string,
    outputFilePath: string,
): Promise<void> => {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(firstVideoPath)
            .input(secondVideoPath)
            .complexFilter([
                // Подготовка видео: приведение каждого видео к одному формату (если нужно)
                '[0:v]scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1[v0]',
                '[1:v]scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1[v1]',
                // Конкатенация двух видео
                '[v0][0:a][v1][1:a]concat=n=2:v=1:a=1[outv][outa]',
            ])
            .outputOptions('-map [outv]') // Используем видеопоток из фильтра
            .outputOptions('-map [outa]') // Используем аудиопоток из фильтра
            .output(outputFilePath) // Указываем выходной файл
            .on('start', (commandLine) => {
                console.log('FFmpeg command: ' + commandLine);
            })
            .on('stderr', (stderrLine) => {
                console.error('FFmpeg stderr:', stderrLine);
            })
            .on('end', () => {
                console.log('Обработка и склейка видео завершены.');
                resolve();
            })
            .on('error', (err) => {
                console.error('Ошибка при обработке видео:', err);
                reject(err);
            })
            .run();
    });
};

export const preparePostText = (originalHashtags: string[]) => {
    const autoHashtags = shuffle(baseHashtags.auto).slice(0, 3);
    const partsHashtags = shuffle(baseHashtags.parts).slice(0, 3);
    const gasolineHashtags = shuffle(baseHashtags.gasoline).slice(0, 3);
    const finalText = postText.replace(
        '{popular-hashtags}',
        [...autoHashtags, ...partsHashtags, ...gasolineHashtags].join(' '),
    );
    console.log({finalText, originalHashtags});
    return finalText.replace('{original-hashtags}', originalHashtags.join(' ')).trim();
};
