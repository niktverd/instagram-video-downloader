import dotenv from 'dotenv';
import {FirebaseApp, initializeApp} from 'firebase/app';
import {Firestore, getFirestore} from 'firebase/firestore/lite';
import {FirebaseStorage, getStorage} from 'firebase/storage';

dotenv.config();

const getFirebaseConfig = (): string | undefined => {
    switch (process.env.APP_ENV) {
        case 'cloud-run':
            return process.env.FIREBASE_CONFIG_REELS_CREATOR;
        case 'development':
            return process.env.FIREBASE_CONFIG_PREPROD;
        case 'server-production':
            return process.env.FIREBASE_CONFIG;
        default:
            return process.env.FIREBASE_CONFIG_PREPROD; // Default to preprod
    }
};

const firebaseConfigData: string | undefined = getFirebaseConfig();

const firebaseConfig = JSON.parse(firebaseConfigData || '{}');

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

export const storage: FirebaseStorage = getStorage(firebaseApp);
export const firestore: Firestore = getFirestore(firebaseApp);
