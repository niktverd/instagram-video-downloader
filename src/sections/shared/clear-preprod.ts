import {collection, deleteDoc, getDocs} from 'firebase/firestore/lite';

import {getAccounts} from './accounts';

import {firestore} from '#config/firebase';
import {Collection} from '#src/constants';
import {log} from '#utils';

export const clearPreprod = async () => {
    if (process.env.APP_ENV !== 'development') {
        log('ClearPreprod is unable only on development server');
    }

    const accounts = await getAccounts();
    for (const account of accounts) {
        const mediaContainersRef = collection(
            firestore,
            Collection.Accounts,
            account.id,
            Collection.AccountMediaContainers,
        );

        const mediaContainerSnaps = await getDocs(mediaContainersRef);
        for (const snap of mediaContainerSnaps.docs) {
            await deleteDoc(snap.ref);
        }
    }

    const preparedColRef = collection(firestore, Collection.PreparedVideos);
    const preparedSnaps = await getDocs(preparedColRef);
    for (const snap of preparedSnaps.docs) {
        await deleteDoc(snap.ref);
    }

    const sourceColRef = collection(firestore, Collection.Sources);
    const sourceSnaps = await getDocs(sourceColRef);
    for (const snap of sourceSnaps.docs) {
        await deleteDoc(snap.ref);
    }
};
