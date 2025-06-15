import {collection, doc, getDoc, setDoc} from 'firebase/firestore/lite';

import {getInstagramInsights} from './aux';

import {firestore} from '#config/firebase';
import {Collection} from '#src/constants';
import {getAllAccounts} from '#src/db';
import {ApiFunctionPrototype} from '#src/types/common';
import {
    UiGetInsightsInstagramReportParams,
    UiGetInsightsInstagramReportResponse,
    UiGetInsightsInstagramScheduleParams,
    UiGetInsightsInstagramScheduleResponse,
} from '#src/types/instagramApi';
import {ThrownError} from '#src/utils/error';
import {log, logError} from '#utils';

export const collectInsightsForAllAccounts: ApiFunctionPrototype<
    UiGetInsightsInstagramScheduleParams,
    UiGetInsightsInstagramScheduleResponse
> = async (params, db) => {
    try {
        const {result: accounts} = await getAllAccounts(params, db);
        let globalDoc: string | undefined;
        let globalDate: string | undefined;
        let totalImpressions = 0;
        const totalReaches = 0;
        const report: Record<string, Record<string, number>> = {};

        for (const account of accounts) {
            if (!account || !account.token) {
                log('Account is empty. Not able to get statistics');
                continue;
            }

            try {
                const insight = await getInstagramInsights(account.token);
                log(insight);
                const data = insight?.data || [];

                for (const parameter of data) {
                    const {name, values} = parameter;
                    console.log('\n\n', {name});
                    if (!report[name]) {
                        report[name] = {};
                    }
                    const {value = 0, end_time: endTime = 'emptydatacontainer'} = values[0] || {};
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
                    report[name][`${account.id} - ${account.slug}`] = value;

                    const total = report[name]?.total || 0;

                    report[name]['total'] = total + value;
                }
            } catch (error) {
                logError(error);
            }
        }

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

            log({report, globalDate, globalDoc, totalImpressions, totalReaches});
        }
    } catch {}

    return {result: 'done', code: 200};
};

export const getInsightsInstagramReport: ApiFunctionPrototype<
    UiGetInsightsInstagramReportParams,
    UiGetInsightsInstagramReportResponse
> = async (params) => {
    const {year, month} = params;
    if (!year || !month) {
        throw new ThrownError('Year and month are required', 400);
    }

    const colRef = collection(firestore, Collection.InsightReports);
    const docRef = doc(colRef, `${year}-${month < 10 ? `0${month}` : month}`);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        throw new ThrownError('Report not found', 404);
    }

    const report = docSnap.data() as UiGetInsightsInstagramReportResponse;
    return {result: report, code: 200};
};
