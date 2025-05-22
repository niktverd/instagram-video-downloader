import {createReadStream, existsSync, mkdirSync, readFileSync} from 'fs';
import path from 'path';

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

import {firestore, storage} from '#config/firebase';
import casinoAudioNames from '#src/config/casino.audioname.json';
import {DelayMS, DelayS} from '#src/constants';
import {
    createInstagramMediaContainer,
    getLimitedInstagramMediaContainers,
    getOnePreparedVideo,
    updateInstagramMediaContainer,
} from '#src/db';
import {IAccount, InstagramLocationSource, MediaPostModelOld} from '#types';
import {
    delay,
    getRandomElementOfArray,
    log,
    logError,
    prepareCaption,
    processAndConcatVideos,
    saveFileToDisk,
} from '#utils';

dotenv.config();

const accessTokensArray = JSON.parse(process.env.INSTAGRAM_ACCESS_TOKEN_ARRAY || '[]') as Record<
    string,
    string
>[];

type CreateInstagramPostContainerArgs = {
    accessToken: string;
    caption: string;
    firebaseId?: string;
    imageUrl?: string;
    locationId?: string;
    videoUrl?: string;
};

export async function createInstagramPostContainer({
    imageUrl,
    caption,
    videoUrl,
    // firebaseId,
    accessToken,
    locationId,
}: CreateInstagramPostContainerArgs) {
    try {
        if (!accessToken) {
            throw new Error('Access token not found');
        }
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        const postData: any = {
            caption,
            access_token: accessToken,
            location_id: locationId,
            share_to_feed: true,
            audio_name: getRandomElementOfArray<string>(casinoAudioNames),
        };
        // ?media_type=REELS
        // &video_url=<REEL_URL>
        // &caption=<IMAGE_CAPTION>
        // &share_to_feed=<TRUE_OR_FALSE>
        // &collaborators=<COLLABORATOR_USERNAMES>
        // &cover_url=<COVER_URL>
        // &audio_name=<AUDIO_NAME>
        // &user_tags=<ARRAY_OF_USERS_FOR_TAGGING>>
        // &location_id=<LOCATION_PAGE_ID>
        // &thumb_offset=<THUMB_OFFSET>
        // &share_to_feed=<TRUE_OR_FALSE>
        // &access_token=<USER_ACCESS_TOKEN>

        if (videoUrl) {
            postData.media_type = 'REELS';
            postData.video_url = videoUrl;
        } else if (imageUrl) {
            postData.image_url = imageUrl;
        } else {
            throw new Error('Data is not provided');
        }
        log({postData});

        const createMediaResponse = await fetch(`https://graph.instagram.com/v21.0/me/media`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        log({createMediaResponse});

        const createMediaResponseJson = await createMediaResponse.json();
        log({createMediaResponseJson});

        const mediaContainerId = createMediaResponseJson.id;

        return {
            success: true,
            mediaContainerId,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        error(error);
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
}: Required<
    Omit<CreateInstagramPostContainerArgs, 'imageUrl' | 'accessToken' | 'caption' | 'locationId'>
> & {
    finalVideoUrl: string;
}) {
    // download video from instagram
    // download my video
    const temp1 = path.join(__dirname, `first.mp4`);
    const temp2 = path.join(__dirname, `second.mp4`);

    const [tempFilePath1, tempFilePath2] = await Promise.all([
        saveFileToDisk(videoUrl, temp1),
        saveFileToDisk(finalVideoUrl, temp2),
    ]);
    // merge videos
    const outputFilePath = path.join(__dirname, `output.mp4`);
    const outputDir = path.dirname(outputFilePath);
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, {recursive: true});
    }
    await processAndConcatVideos(tempFilePath1, tempFilePath2, outputFilePath);
    // upload final video to firebase strorage
    const processedBuffer = readFileSync(outputFilePath);
    const readstream = createReadStream(outputFilePath);
    const fileRef = ref(storage, `${firebaseId}.mp4`);
    const contentType = 'video/mp4';
    const metadata = {contentType};
    await uploadBytes(fileRef, processedBuffer, metadata);

    const downloadURL = await getDownloadURL(fileRef);

    log('Файл успешно загружен:', downloadURL);

    return {downloadURL, readstream};
}

type CublishInstagramPostContainerArgs = {
    containerId: string;
    accessToken: string;
};

export async function publishInstagramPostContainer({
    containerId,
    accessToken,
}: CublishInstagramPostContainerArgs) {
    let lastCheckedIGStatus = 'UNKNOWN';
    try {
        log({containerId, accessToken});
        if (!accessToken || !containerId) {
            throw new Error('Access token not found or container id is empty');
        }

        // const statusResponse = await fetch(`https://graph.instagram.com/v21.0/${containerId}?fields=copyright_check_status&access_token=${accessToken}`);
        const statusResponse = await fetch(
            `https://graph.instagram.com/v21.0/${containerId}?fields=status_code,status&access_token=${accessToken}`,
        );

        const statusResponseJson = await statusResponse.json();
        log({statusResponseJson});

        lastCheckedIGStatus = statusResponseJson.status_code;
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
        log({publishResponseJson});
        return {
            success: true,
            postId: publishResponseJson.id,
            lastCheckedIGStatus,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        logError(error);
        return {
            success: false,
            error: error.response?.data || error.message,
            lastCheckedIGStatus,
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
        log({schedule, now, diff});

        if (diff < DelayS.Min10) {
            return;
        }
    }

    const collectionRef = collection(firestore, 'media-post');
    const docSnaps = await getDocs(collectionRef);

    const documents = shuffle(
        docSnaps.docs.map(
            (snap) => ({...snap.data(), id: snap.id} as unknown as MediaPostModelOld),
        ),
    );
    for (const document of documents) {
        log(document);
        const documentRef = doc(collectionRef, document.id);

        if (document.mediaContainerId && document.status !== 'published') {
            const tokenObj = accessTokensArray.find(({id}) => id === document.account);
            const accessToken = tokenObj?.token || accessTokensArray[0].token;
            log({accessTokensArray});
            log({tokenObj});
            log({'tokenObj?.token': tokenObj?.token});
            log({accessToken});
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

        log({dateDiff, delay: DelayS.Day2});

        if (dateDiff > DelayS.Day2) {
            await deleteDoc(documentRef);
        }
    }
}

type CanInstagramPostBePublishedArgs = {
    mediaContainerId: string;
    accessToken: string;
};

export const canInstagramPostBePublished = async ({
    mediaContainerId,
    accessToken,
}: CanInstagramPostBePublishedArgs) => {
    try {
        log({mediaContainerId, accessToken});
        if (!accessToken || !mediaContainerId) {
            throw new Error('Access token not found or container id is empty');
        }

        const statusResponse = await fetch(
            `https://graph.instagram.com/v21.0/${mediaContainerId}?fields=status_code,status&access_token=${accessToken}`,
        );

        const statusResponseJson = await statusResponse.json();
        log({statusResponseJson});

        if (statusResponseJson.status_code !== 'FINISHED') {
            throw new Error('Container is not ready to be published');
        }

        return true;
    } catch (error) {
        log(error);
        return false;
    }
};

export const prepareMediaContainersForAccount = async (account: IAccount) => {
    const mediaContainers = await getLimitedInstagramMediaContainers({
        accountId: account.id,
        random: true,
        notPublished: true,
        limit: 10,
    });

    if (mediaContainers.length) {
        log('Not necessary to prepare media containers', mediaContainers);
        return;
    }

    const preparedVideo = await getOnePreparedVideo({
        accountId: account.id,
        hasFirebaseUrl: true,
        random: true,
        notInInstagramMediaContainers: true,
        fetchGraphScenario: true,
        fetchGraphSource: true,
    });

    if (!preparedVideo) {
        log('Has no prepared video', preparedVideo);
        return;
    }

    const caption = prepareCaption(preparedVideo.scenario?.texts);
    const videoUrl = preparedVideo.firebaseUrl;
    // const hashtags = [];
    const scenario = preparedVideo.scenario;
    const {instagramLocationSource, instagramLocations} = scenario || {};

    const localLocations =
        instagramLocationSource === InstagramLocationSource.Scenario
            ? instagramLocations
            : account.instagramLocations;

    const randomLocation = getRandomElementOfArray(localLocations || []);
    log({randomLocation});

    const locationId = randomLocation?.externalId;
    if (account.token) {
        const result = await createInstagramPostContainer({
            caption,
            videoUrl,
            locationId,
            accessToken: account.token,
        });

        if (result.success) {
            await createInstagramMediaContainer({
                accountId: account.id,
                preparedVideoId: preparedVideo.id,
                containerId: result.mediaContainerId,
            });
        }

        log(result);
    }
};

export const publishRandomInstagramContainerForAccount = async (account: IAccount) => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const mediaContainers = await getLimitedInstagramMediaContainers({
            accountId: account.id,
            random: true,
            notPublished: true,
            limit: 1,
        });

        if (!mediaContainers.length) {
            return {
                success: false,
                message: 'no_media_containers',
            };
        }

        const mediaContainer = mediaContainers[0];
        const {containerId} = mediaContainer;

        const publishResponse = await publishInstagramPostContainer({
            containerId: containerId as string,
            accessToken: account.token || '',
        });

        if (publishResponse.success) {
            await updateInstagramMediaContainer({
                id: mediaContainer.id as number,
                attempts: ((mediaContainer.attempts || 0) as number) + 1,
                error: publishResponse.error || '',
                mediaId: publishResponse.postId || '',
                lastCheckedIGStatus: publishResponse.lastCheckedIGStatus || '',
                isPublished: true,
            });

            return publishResponse;
        } else {
            const newAttempts = ((mediaContainer.attempts || 0) as number) + 1;
            await updateInstagramMediaContainer({
                id: mediaContainer.id as number,
                attempts: newAttempts,
                error: publishResponse.error || '',
                lastCheckedIGStatus: publishResponse.lastCheckedIGStatus || '',
                isBlocked: newAttempts > 3,
                blockedReason: newAttempts > 3 ? 'Too many attempts' : undefined,
            });

            await delay(DelayMS.Sec5);
        }
    }
};
