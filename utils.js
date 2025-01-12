const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage, firestore } = require('./config/firebase');
const { doc, collection, updateDoc } = require('firebase/firestore/lite');

async function uploadFileFromUrl({
    url,
    firebaseId,
}) {
  try {
    // Загружаем файл из URL
    const response = await fetch(
        url,
        {
            method: 'GET',
            responseType: 'arraybuffer', // Скачиваем файл как массив байтов
        }
    );

    // const fileBuffer = Buffer.from(response.data);
    const fileBuffer = await response.arrayBuffer();
    const contentType = response.headers['content-type'];

    // Указываем путь файла в Firebase Storage
    const fileRef = ref(storage, `${firebaseId}.mp4`);

    // Загружаем файл в Storage
    const metadata = { contentType };
    await uploadBytes(fileRef, fileBuffer, metadata);

    // Получаем ссылку на скачивание
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

module.exports = {
    uploadFileFromUrl,
};
