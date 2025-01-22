import {existsSync, mkdirSync, rmSync} from 'fs';

import {collection, doc, getDocs, limit, query, updateDoc, where} from 'firebase/firestore/lite';
import {shuffle} from 'lodash';

import {firestore} from './config/firebase';
import {Collection, DelayMS} from './constants';
import {createInstagramPostContainer, getMergedVideo} from './instagram';
import {MediaPostModel, Sources} from './types';
import {preparePostText} from './utils';

const accessTokensArray = JSON.parse(process.env.INSTAGRAM_ACCESS_TOKEN_ARRAY || '[]');
const SECOND_VIDEO =
    'https://firebasestorage.googleapis.com/v0/b/media-automation-6aff2.firebasestorage.app/o/assets%2F0116.mp4?alt=media&token=60b0b84c-cd07-4504-9a6f-a6a44ea73ec4';

const downloadSource = async (sources: Sources, firebaseId: string) => {
    console.log(
        'downloading source...',
        JSON.stringify({sources, x: sources.instagramReel}, null, 2),
    );
    if (sources.instagramReel) {
        console.log('instagram found...');
        return await getMergedVideo({
            videoUrl: sources.instagramReel.url,
            finalVideoUrl: SECOND_VIDEO,
            firebaseId: firebaseId,
        });
    }

    if (sources.youtubeShort) {
        // download youtube video
        return null;
    }

    return null;
};

export const preprocessVideo = (ms: number) => {
    console.log('preprocessVideo', 'start');
    // на каждый видос 2 попытки
    // после второй неуспешной пишем в базу метку, что проблемный. Если такая метка уже была, удаляем из базы после двух попыток все уладить
    //   +    грузим по 10 видосов, выбираем рандомно с каким будем работать
    //   +    Если нечего обрабатывать, то откладываем запуск на 5 минут
    //   +    получить необработанное видео
    //   +/-  скачать необработанное видео
    //   +/-  скачать финалочку
    //   +/-  смерджить два видео
    //   +/-  загрузить в хранилище
    //   +    удаляем временные файлы
    //   +    обновить запись в базе: ссылку firebaseUrl в документе
    //   +    создать контейнеры в инстаграм
    // запланировать пост в youtube
    //   +    обновить запись в базе: статусы на площадках публикаций

    setTimeout(async () => {
        const collectionRef = collection(firestore, Collection.MediaPosts);
        const queryRef = query(collectionRef, where('firebaseUrl', '==', ''), limit(10));
        const docSnaps = await getDocs(queryRef);
        if (docSnaps.empty) {
            console.log('doc snap is empty');
            preprocessVideo(DelayMS.Min5);
            return;
        }

        const medias = shuffle(
            docSnaps.docs.map((snap) => ({...snap.data(), id: snap.id} as MediaPostModel)),
        );
        console.log('medias length:', medias.length);

        for (const media of medias) {
            const firebaseId = media.id;
            console.log('working with media id: ', firebaseId);
            try {
                for (let attempt = 0; attempt < 2; attempt++) {
                    // create video
                    if (!existsSync(firebaseId)) {
                        console.log('creating folder ...');
                        mkdirSync(firebaseId, {recursive: true});
                    }

                    const preparedVideoUrl = await downloadSource(media.sources, firebaseId);
                    if (!preparedVideoUrl) {
                        continue;
                    }

                    // update firestore record
                    const documentRef = doc(collectionRef, firebaseId);
                    await updateDoc(documentRef, {
                        firebaseUrl: preparedVideoUrl,
                    });

                    const caption = preparePostText(
                        media.sources.instagramReel?.originalHashtags || [],
                    );

                    for (const tokenObject of accessTokensArray) {
                        const result = await createInstagramPostContainer({
                            videoUrl: preparedVideoUrl,
                            caption:
                                caption ||
                                'Оптовые цены на запчасти и расходники для авто для наших подписчиков (пока только в Астане). Пишите в директ, какая запчасть или какое масло вы ищите и мы предоставим вам лучшие цены с оптовых складов. Присылайте ссылку на свой профиль, чтобы мы убедились, что вы наш подписчик.',
                            accessToken: tokenObject.token,
                            firebaseId: firebaseId,
                        });

                        if (result.success && result.mediaId) {
                            // const collectionRef = collection(firestore, 'media-post');
                            // const documentRef = doc(collectionRef, firebaseId);
                            // eslint-disable-next-line max-depth
                            const propertyName =
                                tokenObject.id === 'carcar.kz'
                                    ? 'publishedOnInstagramCarcarKz'
                                    : 'publishedOnInstagramCarcarTech';
                            await updateDoc(documentRef, {
                                [propertyName]: {
                                    ...media[propertyName],
                                    mediaContainerId: result.mediaId,
                                    status: 'uploaded',
                                },
                            });
                        }
                    }

                    break;
                }
            } catch (error) {
                console.log(error);
                if (media.attempt) {
                    // delete media
                } else {
                    // save attempt to media
                }
            } finally {
                if (existsSync(firebaseId)) {
                    rmSync(firebaseId, {maxRetries: 2, force: true, recursive: true});
                }
            }
        }

        preprocessVideo(DelayMS.Sec1);
    }, ms);
};
