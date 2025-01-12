require('dotenv').config();

const {initializeApp} = require("firebase/app");
const {getFirestore} = require('firebase/firestore/lite');
const {getStorage} = require('firebase/storage');

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG || '{}');

const firebaseApp = initializeApp(firebaseConfig);

const storage = getStorage(firebaseApp);
const firestore = getFirestore(firebaseApp);

module.exports = {
    storage,
    firestore,
};
