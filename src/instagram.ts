import dotenv from 'dotenv';
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
} from 'firebase/firestore/lite';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import {shuffle} from 'lodash';

import {firestore, storage} from '../config/firebase';

import {MediaPostModel} from './types';
import {getBufferVideo, processAndConcatVideos} from './utils';

dotenv.config();

// const IG_ID = process.env.IG_ID;
const accessTokensArray = JSON.parse(process.env.INSTAGRAM_ACCESS_TOKEN_ARRAY || '[]') as Record<
    string,
    string
>[];
const SECONDS_IN_DAY = 48 * 60 * 60;
const TEN_MINUTES = 10 * 60;

type CreateInstagramPostContainerArgs = {
    accessToken: string;
    caption: string;
    firebaseId: string;
    imageUrl?: string;
    videoUrl?: string;
};

export async function createInstagramPostContainer({
    imageUrl,
    caption,
    videoUrl,
    firebaseId,
    accessToken,
}: CreateInstagramPostContainerArgs) {
    try {
        if (!accessToken) {
            throw new Error('Access token not found');
        }
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const postData: any = {caption, access_token: accessToken};

        if (videoUrl) {
            postData.media_type = 'REELS';
            postData.video_url = videoUrl;
        } else if (imageUrl) {
            postData.image_url = imageUrl;
        } else {
            throw new Error('Data is not provided');
        }
        console.log({postData});

        const createMediaResponse = await fetch(`https://graph.instagram.com/v21.0/me/media`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        const createMediaResponseJson = await createMediaResponse.json();
        console.log({createMediaResponseJson});

        const mediaId = createMediaResponseJson.id;

        const collectionRef = collection(firestore, 'media-post');
        const documentRef = doc(collectionRef, firebaseId);
        await updateDoc(documentRef, {
            mediaContainerId: mediaId,
        });

        return {
            success: true,
            mediaId,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            error: error.response?.data || error.message,
        };
    }
}

export async function getMergedVideo({
    videoUrl,
    finalVideoUrl,
    firebaseId,
}: Required<Omit<CreateInstagramPostContainerArgs, 'imageUrl' | 'accessToken' | 'caption'>> & {
    finalVideoUrl: string;
}) {
    // download video from instagram
    // download my video
    const [buffer1, buffer2] = await Promise.all([
        getBufferVideo(videoUrl),
        getBufferVideo(finalVideoUrl),
    ]);
    // merge videos
    const processedBuffer = await processAndConcatVideos(buffer1, buffer2);
    // upload final video to firebase strorage
    const fileRef = ref(storage, `${firebaseId}.mp4`);
    const contentType = 'video/mp4';
    const metadata = {contentType};
    await uploadBytes(fileRef, processedBuffer, metadata);

    const downloadURL = await getDownloadURL(fileRef);

    console.log('Файл успешно загружен:', downloadURL);

    // // update firestore record
    // const collectionRef = collection(firestore, 'media-post');
    // const documentRef = doc(collectionRef, firebaseId);
    // await updateDoc(documentRef, {
    //     firebaseUrl: downloadURL,
    // });

    // create media container
    return downloadURL;
}

type CublishInstagramPostContainerArgs = {
    containerId: string;
    accessToken: string;
};

export async function publishInstagramPostContainer({
    containerId,
    accessToken,
}: CublishInstagramPostContainerArgs) {
    try {
        if (!accessToken || !containerId) {
            throw new Error('Access token not found or container id is empty');
        }

        // const statusResponse = await fetch(`https://graph.instagram.com/v21.0/${containerId}?fields=copyright_check_status&access_token=${accessToken}`);
        const statusResponse = await fetch(
            `https://graph.instagram.com/v21.0/${containerId}?fields=status_code,status&access_token=${accessToken}`,
        );

        const statusResponseJson = await statusResponse.json();
        console.log(JSON.stringify({statusResponseJson}));

        if (statusResponseJson.status_code !== 'FINISHED') {
            throw new Error('Media is not ready to be published');
        }

        // Then publish the container
        const publishResponse = await fetch(`https://graph.instagram.com/v21.0/me/media_publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                creation_id: containerId,
                access_token: accessToken,
            }),
        });

        const publishResponseJson = await publishResponse.json();
        console.log(JSON.stringify({publishResponseJson}));
        return {
            success: true,
            postId: publishResponseJson.id,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error(error);
        return {
            success: false,
            error: error.response?.data || error.message,
        };
    }
}

export async function findUnpublishedContainer() {
    const systemCollectionRef = collection(firestore, 'system');
    const scheduleDocRef = doc(systemCollectionRef, 'schedule');
    const scheduleSnap = await getDoc(scheduleDocRef);
    if (scheduleSnap.exists()) {
        const schedule = scheduleSnap.data();
        const now = new Date().getTime() / 1000;
        const diff = now - schedule.lastPublishingTime.seconds;
        console.log({schedule, now, diff});

        if (diff < TEN_MINUTES) {
            return;
        }
    }

    const collectionRef = collection(firestore, 'media-post');
    const docSnaps = await getDocs(collectionRef);

    const documents = shuffle(
        docSnaps.docs.map((snap) => ({...snap.data(), id: snap.id} as unknown as MediaPostModel)),
    );
    for (const document of documents) {
        console.log(document);
        const documentRef = doc(collectionRef, document.id);

        if (document.mediaContainerId && document.status !== 'published') {
            const tokenObj = accessTokensArray.find(({id}) => id === document.account);
            const accessToken = tokenObj?.token || accessTokensArray[0].token;
            console.log(JSON.stringify({accessTokensArray}));
            console.log(JSON.stringify({tokenObj}));
            console.log(JSON.stringify({'tokenObj?.token': tokenObj?.token}));
            console.log(JSON.stringify({accessToken}));
            const result = await publishInstagramPostContainer({
                containerId: document.mediaContainerId,
                accessToken,
            });
            if (result?.success) {
                await updateDoc(documentRef, {status: 'published'});
                await setDoc(scheduleDocRef, {lastPublishingTime: new Date()});
                return;
            }
        }

        const createdAt = document.createdAt;
        const now = new Date();
        const dateDiff = now.getTime() / 1000 - createdAt.seconds;

        console.log({dateDiff, SECONDS_IN_DAY});

        if (dateDiff > SECONDS_IN_DAY) {
            await deleteDoc(documentRef);
        }
    }
}
