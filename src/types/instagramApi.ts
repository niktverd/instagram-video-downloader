import {z} from 'zod';

import {
    MessageWebhookV3ResponseSchema,
    MessageWebhookV3Schema,
    UiGetInsightsInstagramReportParamsSchema,
    UiGetInsightsInstagramReportResponseSchema,
    UiGetInsightsInstagramScheduleParamsSchema,
    UiGetInsightsInstagramScheduleResponseSchema,
} from '#schemas/handlers/instagramAPI';

export type MessageWebhookV3Params = z.infer<typeof MessageWebhookV3Schema>;
export type MessageWebhookV3Response = z.infer<typeof MessageWebhookV3ResponseSchema>;

export type UiGetInsightsInstagramScheduleParams = z.infer<
    typeof UiGetInsightsInstagramScheduleParamsSchema
>;
export type UiGetInsightsInstagramScheduleResponse = z.infer<
    typeof UiGetInsightsInstagramScheduleResponseSchema
>;

export type UiGetInsightsInstagramReportParams = z.infer<
    typeof UiGetInsightsInstagramReportParamsSchema
>;
export type UiGetInsightsInstagramReportResponse = z.infer<
    typeof UiGetInsightsInstagramReportResponseSchema
>;
