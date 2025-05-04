import {collection, doc, getDoc, getDocs, setDoc} from 'firebase/firestore/lite';

import {firestore} from '#config/firebase';
import {Collection} from '#src/constants';
import {AccountV3} from '#types';
import {log} from '#utils';

type AddAccountArgs = {
    id: string;
    values: AccountV3;
};

export const addAccount = async ({id, values}: AddAccountArgs) => {
    log('addAccount', {id, values});
    const docRef = doc(firestore, Collection.Accounts, id);
    const result = await setDoc(docRef, values);
    log(result);
};

export const patchAccount = async ({id, values}: AddAccountArgs) => {
    if (values.id !== id) {
        await addAccount({id, values: {...values, id, disabled: true}});
    }

    await addAccount({id: values.id, values});
};

export const getAccounts = async (onlyEnabled = false) => {
    const collectionRef = collection(firestore, Collection.Accounts);
    const snaps = await getDocs(collectionRef);
    if (snaps.empty) {
        throw new Error(`Collection ${Collection.Accounts} is empty`);
    }
    const data = snaps.docs.map((snap) => ({...snap.data(), id: snap.id} as AccountV3));

    log('getAccounts', {data});

    return data.filter(({disabled}) => (onlyEnabled ? !disabled : true));
};

export const getAccount = async (id: string) => {
    const collectionRef = collection(firestore, Collection.Accounts);
    const docRef = doc(collectionRef, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
        throw new Error(`Account ${id} not found`);
    }
    return snap.data() as AccountV3;
};
