import {collectInsightsForAllAccounts, getInsightsInstagramReport} from '../components/insights';

import {
    UiGetInsightsInstagramReportParamsSchema,
    UiGetInsightsInstagramScheduleParamsSchema,
} from '#schemas/handlers';
import {wrapper} from '#src/db';
import {
    UiGetInsightsInstagramReportParams,
    UiGetInsightsInstagramReportResponse,
    UiGetInsightsInstagramScheduleParams,
    UiGetInsightsInstagramScheduleResponse,
} from '#src/types/instagramApi';

export const getInsightsInstagramScheduleGet = wrapper<
    UiGetInsightsInstagramScheduleParams,
    UiGetInsightsInstagramScheduleResponse
>(collectInsightsForAllAccounts, UiGetInsightsInstagramScheduleParamsSchema, 'GET');

export const getInsightsInstagramReportGet = wrapper<
    UiGetInsightsInstagramReportParams,
    UiGetInsightsInstagramReportResponse
>(getInsightsInstagramReport, UiGetInsightsInstagramReportParamsSchema, 'GET');
