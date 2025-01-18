import {Readable, Writable} from 'stream';

import {collection, doc, updateDoc} from 'firebase/firestore/lite';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import ffmpeg from 'fluent-ffmpeg';

import {firestore, storage} from '../config/firebase';
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

export const processAndConcatVideos = async (
    firstVideo: Buffer,
    secondVideo: Buffer,
): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        // Создаем потоки для чтения из Buffer
        const readableStream1 = new Readable({
            read() {
                this.push(firstVideo);
                this.push(null); // Сигнализируем конец данных
            },
        });

        const readableStream2 = new Readable({
            read() {
                this.push(secondVideo);
                this.push(null); // Сигнализируем конец данных
            },
        });

        const chunks: Buffer[] = [];
        const writableStream = new Writable({
            write(chunk, _encoding, callback) {
                chunks.push(chunk);
                callback();
            },
        });

        // Обработка и склейка видео с ffmpeg
        ffmpeg()
            .input(readableStream1)
            .input(readableStream2)
            .complexFilter(
                [
                    // Изменяем разрешение каждого видео до 1080x1920 (9:16)
                    '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1[v0]',
                    '[1:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1[v1]',
                    // Склеиваем видео вертикально
                    '[v0][v1]vstack=inputs=2[outv]',
                ],
                'outv',
            )
            .outputOptions('-map [outv]') // Указываем выходной видеопоток
            .format('mp4') // Указываем формат выходного файла
            .on('end', () => {
                console.log('Обработка и склейка видео завершены.');
                const processedBuffer = Buffer.concat(chunks);
                resolve(processedBuffer);
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .on('error', (err: any) => {
                console.error('Ошибка при обработке видео:', err);
                reject(err);
            })
            .pipe(writableStream, {end: true}); // Перенаправляем вывод в writableStream
    });
};
