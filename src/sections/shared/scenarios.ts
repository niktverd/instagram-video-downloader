import {addDoc, collection, doc, getDoc, getDocs, updateDoc} from 'firebase/firestore/lite';

import {firestore} from '#config/firebase';
import {Collection} from '#src/constants';
import {ThrownError} from '#src/utils/error';
import {ScenarioV4, SourceV3} from '#types';
import {log} from '#utils';

export const getScenarios = async (onlyEnabled = false) => {
    const collectionRef = collection(firestore, Collection.Scenarios);
    const snaps = await getDocs(collectionRef);
    if (snaps.empty) {
        throw new ThrownError(`Collection ${Collection.Scenarios} is empty`, 400);
    }
    const data = snaps.docs.map((snap) => ({...snap.data(), id: 1} as ScenarioV4));

    return data.filter(({enabled}) => (onlyEnabled ? enabled : true));
};

export const getScenario = async (id: string): Promise<ScenarioV4> => {
    const colRef = collection(firestore, Collection.Scenarios);
    const docRef = doc(colRef, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
        throw new ThrownError(`Scenario ${id} not found`, 400);
    }

    return {...snap.data(), id: 1} as ScenarioV4;
};

type PatchScenarioArgs = {
    id: string;
    values: ScenarioV4;
};

export const patchScenario = async ({id, values}: PatchScenarioArgs) => {
    const colRef = collection(firestore, Collection.Scenarios);
    const docRef = doc(colRef, id);
    await updateDoc(docRef, values);
};

type AddScenarioArgs = {
    id: string;
    values: ScenarioV4;
};

export const addScenario = async ({values}: AddScenarioArgs) => {
    const colRef = collection(firestore, Collection.Scenarios);
    await addDoc(colRef, values);
};

export const regScenarioUsage = async (source: SourceV3, scenarioName: string) => {
    log({source, scenarioName});
    if (!source || !scenarioName) {
        return;
    }

    const colRef = collection(firestore, Collection.Sources);
    const docRef = doc(colRef, source.id);
    await updateDoc(docRef, {
        scenarios: source.scenarios.filter((name) => name !== scenarioName),
        scenariosHasBeenCreated: source.scenariosHasBeenCreated?.length
            ? [...source.scenariosHasBeenCreated, scenarioName]
            : [scenarioName],
    });
    const updatedDoc = await getDoc(docRef);
    if (updatedDoc.exists()) {
        log(
            source.id,
            {
                scenarios: source.scenarios.filter((name) => name !== scenarioName),
            },
            updatedDoc.data(),
        );
    } else {
        log('doc', source.id, 'is not exist');
    }
};
