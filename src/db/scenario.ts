/* eslint-disable @typescript-eslint/no-explicit-any */
import {PartialModelObject, Transaction} from 'objection';
import {z} from 'zod';

import {Scenario} from '../models/Scenario';

import db from './utils';

import {ScenarioType} from '#schemas/scenario';

export const CreateScenarioParamsSchema = z
    .object({
        slug: z.string(),
        type: z.nativeEnum(ScenarioType),
        enabled: z.boolean().optional(),
        copied_from: z.number().nullable().optional(),
        options: z.record(z.any()).optional(),
    })
    .strict();

export type CreateScenarioParams = z.infer<typeof CreateScenarioParamsSchema>;
export type CreateScenarioResponse = PartialModelObject<Scenario>;

export async function createScenario(
    params: CreateScenarioParams,
    trx?: Transaction,
): Promise<CreateScenarioResponse> {
    const scenarioData: PartialModelObject<Scenario> = {
        slug: params.slug,
        enabled: params.enabled ?? true,
        options: params.options || {},
        type: params.type,
    };

    // Handle nullable field separately using type casting
    if (params.copied_from !== undefined && params.copied_from !== null) {
        // Force type as any to bypass type checking for this property
        scenarioData.copied_from = params.copied_from;
    }

    console.log('scenarioData', scenarioData);
    const scenario = await Scenario.query(trx || db).insert(scenarioData);
    console.log('scenario', scenario);
    return scenario;
}

export const GetScenarioByIdParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export type GetScenarioByIdParams = z.infer<typeof GetScenarioByIdParamsSchema>;
export type GetScenarioByIdResponse = PartialModelObject<Scenario>;

export async function getScenarioById(
    params: GetScenarioByIdParams,
    trx?: Transaction,
): Promise<GetScenarioByIdResponse> {
    const scenario = await Scenario.query(trx || db).findById(params.id);
    if (!scenario) {
        throw new Error('Scenario not found');
    }

    return scenario;
}

export const GetScenarioBySlugParamsSchema = z
    .object({
        slug: z.string(),
    })
    .strict();

export type GetScenarioBySlugParams = z.infer<typeof GetScenarioBySlugParamsSchema>;
export type GetScenarioBySlugResponse = PartialModelObject<Scenario>;

export async function getScenarioBySlug(
    params: GetScenarioBySlugParams,
    trx?: Transaction,
): Promise<GetScenarioBySlugResponse> {
    const scenario = await Scenario.query(trx || db)
        .where('slug', params.slug)
        .first();

    if (!scenario) {
        throw new Error('Scenario not found');
    }

    return scenario;
}

export const GetAllScenariosParamsSchema = z.object({}).strict();
export type GetAllScenariosParams = z.infer<typeof GetAllScenariosParamsSchema>;
export type GetAllScenariosResponse = PartialModelObject<Scenario>[];

export async function getAllScenarios(
    _params: GetAllScenariosParams,
    trx?: Transaction,
): Promise<GetAllScenariosResponse> {
    const scenarios = await Scenario.query(trx || db);
    return scenarios;
}

export const UpdateScenarioParamsSchema = CreateScenarioParamsSchema.partial()
    .extend({
        id: z.number(),
    })
    .strict();

export type UpdateScenarioParams = z.infer<typeof UpdateScenarioParamsSchema>;
export type UpdateScenarioResponse = PartialModelObject<Scenario>;
export async function updateScenario(
    params: UpdateScenarioParams,
    trx?: Transaction,
): Promise<Scenario> {
    const {id, ...updateData} = UpdateScenarioParamsSchema.parse(params);

    // Create a clean update object without undefined/null values that might cause type issues
    const cleanUpdateData: any = {};

    if (updateData.slug !== undefined) {
        cleanUpdateData.slug = updateData.slug;
    }

    if (updateData.enabled !== undefined) {
        cleanUpdateData.enabled = updateData.enabled;
    }

    if (updateData.copied_from !== undefined) {
        cleanUpdateData.copied_from = updateData.copied_from;
    }

    if (updateData.options !== undefined) {
        cleanUpdateData.options = updateData.options;
    }

    const scenario = await Scenario.query(trx || db).patchAndFetchById(id, cleanUpdateData);
    return scenario;
}

export const DeleteScenarioParamsSchema = z
    .object({
        id: z.number(),
    })
    .strict();

export type DeleteScenarioParams = z.infer<typeof DeleteScenarioParamsSchema>;
export type DeleteScenarioResponse = number;

export async function deleteScenario(
    params: DeleteScenarioParams,
    trx?: Transaction,
): Promise<DeleteScenarioResponse> {
    console.log('params', params);
    const deletedCount = await Scenario.query(trx || db).deleteById(params.id);
    return deletedCount;
}
