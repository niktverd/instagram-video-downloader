require('dotenv').config();

const {initializeApp} = require('firebase/app');
const {getFirestore} = require('firebase/firestore/lite');
const {getStorage} = require('firebase/storage');

const firebaseConfigData =
    process.env.APP_ENV === 'development'
        ? process.env.FIREBASE_CONFIG_PREPROD
        : process.env.FIREBASE_CONFIG;

const firebaseConfig = JSON.parse(firebaseConfigData || '{}');

const firebaseApp = initializeApp(firebaseConfig);

const storage = getStorage(firebaseApp);
const firestore = getFirestore(firebaseApp);

module.exports = {
    storage,
    firestore,
};
