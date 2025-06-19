import {collectInsightsForAllAccounts, getInsightsInstagramReport} from '../components/insights';

import {wrapper} from '#src/db';
import {
    UiGetInsightsInstagramReportParams,
    UiGetInsightsInstagramReportResponse,
    UiGetInsightsInstagramScheduleParams,
    UiGetInsightsInstagramScheduleResponse,
} from '#src/types/instagramApi';
import {
    UiGetInsightsInstagramReportParamsSchema,
    UiGetInsightsInstagramScheduleParamsSchema,
} from '#src/types/schemas/handlers';

export const getInsightsInstagramScheduleGet = wrapper<
    UiGetInsightsInstagramScheduleParams,
    UiGetInsightsInstagramScheduleResponse
>(collectInsightsForAllAccounts, UiGetInsightsInstagramScheduleParamsSchema, 'GET');

export const getInsightsInstagramReportGet = wrapper<
    UiGetInsightsInstagramReportParams,
    UiGetInsightsInstagramReportResponse
>(getInsightsInstagramReport, UiGetInsightsInstagramReportParamsSchema, 'GET');
