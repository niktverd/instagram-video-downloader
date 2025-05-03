import {Request, Response} from 'express';
import {collection, doc, getDoc, setDoc} from 'firebase/firestore/lite';

import {getInstagramInsights} from '../components';

import {firestore} from '#config/firebase';
import {getAccounts} from '#logic';
import {Collection} from '#src/constants';
import {log, logError} from '#utils';

export const getInsightsInstagramSchedule = async (_req: Request, res: Response) => {
    res.status(200).send({message: 'statistic started'});
    try {
        const accounts = await getAccounts();
        let globalDoc: string | undefined;
        let globalDate: string | undefined;
        let totalImpressions = 0;
        let totalReaches = 0;
        const report: Record<string, number> = {};

        for (const account of accounts) {
            if (!account) {
                log('Account is empty. Not able to get statistics');
                continue;
            }

            try {
                const insight = await getInstagramInsights(account.token);
                log(insight);
                const data = insight?.data || [];

                for (const parameter of data) {
                    const {name, values} = parameter;
                    if (name === 'impressions') {
                        const {value = 0, end_time: endTime = 'emptydatacontainer'} =
                            values[0] || {};
                        const date = endTime.slice(0, 10);

                        // eslint-disable-next-line max-depth
                        if (!globalDate) {
                            globalDate = date;
                        }
                        // eslint-disable-next-line max-depth
                        if (!globalDoc) {
                            globalDoc = date.slice(0, 7);
                        }

                        totalImpressions += value;
                        report[`${account.id} - impressions`] = value;
                    }

                    if (name === 'reach') {
                        const {value = 0, end_time: endTime = 'emptydatacontainer'} =
                            values[0] || {};
                        const date = endTime.slice(0, 10);

                        // eslint-disable-next-line max-depth
                        if (!globalDate) {
                            globalDate = date;
                        }
                        // eslint-disable-next-line max-depth
                        if (!globalDoc) {
                            globalDoc = date.slice(0, 7);
                        }

                        totalReaches += value;
                        report[`${account.id} - reach`] = value;
                    }
                }
            } catch (error) {
                logError(error);
            }
        }

        report.totalImpressions = totalImpressions;
        report.totalReaches = totalReaches;

        if (globalDate) {
            const colRef = collection(firestore, Collection.InsightReports);
            const docRef = doc(colRef, globalDoc);
            const docSnap = await getDoc(docRef);

            let docData = {};
            if (docSnap.exists()) {
                docData = {...docSnap.data()};
            }

            log(report);

            await setDoc(docRef, {
                ...docData,
                [globalDate]: report,
            });
        }
    } catch (error) {
        logError(error);
    }
};
