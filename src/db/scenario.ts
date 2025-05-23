/* eslint-disable @typescript-eslint/no-explicit-any */
import {Transaction} from 'objection';

import {Scenario} from '../models/Scenario';

import db from './utils';

import {
    CreateScenarioParamsSchema,
    UpdateScenarioParamsSchema,
    DeleteScenarioParamsSchema as _DeleteScenarioParamsSchema,
    GetAllScenariosParamsSchema as _GetAllScenariosParamsSchema,
    GetScenarioByIdParamsSchema as _GetScenarioByIdParamsSchema,
    GetScenarioBySlugParamsSchema as _GetScenarioBySlugParamsSchema,
} from '#schemas/handlers/scenario';
import {
    CreateScenarioParams,
    CreateScenarioResponse,
    DeleteScenarioParams,
    DeleteScenarioResponse,
    GetAllScenariosParams,
    GetAllScenariosResponse,
    GetScenarioByIdParams,
    GetScenarioByIdResponse,
    GetScenarioBySlugParams,
    GetScenarioBySlugResponse,
    UpdateScenarioParams,
    IScenario as _IScenario,
    UpdateScenarioResponse as _UpdateScenarioResponse,
} from '#types';

export async function createScenario(
    params: CreateScenarioParams,
    trx?: Transaction,
): Promise<CreateScenarioResponse> {
    const validatedParams = CreateScenarioParamsSchema.parse(params);
    const scenarioData: Record<string, any> = {
        slug: validatedParams.slug,
        enabled: validatedParams.enabled ?? true,
        options: validatedParams.options || {},
        type: validatedParams.type,
    };

    if (typeof validatedParams.copiedFrom === 'number') {
        scenarioData.copiedFrom = validatedParams.copiedFrom;
    }

    return await (trx || db).transaction(async (t) => {
        console.log('scenarioData', scenarioData);
        const scenario = await Scenario.query(t).insert(scenarioData);
        console.log('scenario', scenario);

        // Handle instagram locations if provided
        if (validatedParams.instagramLocations?.length) {
            const locationRows = validatedParams.instagramLocations.map(
                ({id: instagramLocationId}) => ({
                    scenarioId: scenario.id,
                    instagramLocationId,
                }),
            );

            await t('scenarioInstagramLocations').insert(locationRows);
        }

        return scenario;
    });
}

export async function getScenarioById(
    params: GetScenarioByIdParams,
    trx?: Transaction,
): Promise<GetScenarioByIdResponse> {
    const scenario = await Scenario.query(trx || db)
        .findById(params.id)
        .withGraphFetched('instagramLocations');

    if (!scenario) {
        throw new Error('Scenario not found');
    }

    return scenario;
}

export async function getScenarioBySlug(
    params: GetScenarioBySlugParams,
    trx?: Transaction,
): Promise<GetScenarioBySlugResponse> {
    const scenario = await Scenario.query(trx || db)
        .where('slug', params.slug)
        .first()
        .withGraphFetched('instagramLocations');

    if (!scenario) {
        throw new Error('Scenario not found');
    }

    return scenario;
}

export async function getAllScenarios(
    _params: GetAllScenariosParams,
    trx?: Transaction,
): Promise<GetAllScenariosResponse> {
    const scenarios = await Scenario.query(trx || db).withGraphFetched('instagramLocations');
    return scenarios;
}

export async function updateScenario(
    params: UpdateScenarioParams,
    trx?: Transaction,
): Promise<Scenario> {
    const {id, instagramLocations, ...updateData} = UpdateScenarioParamsSchema.parse(params);

    // Create a clean update object without undefined/null values that might cause type issues
    const cleanUpdateData: any = {};

    Object.entries(updateData).forEach(([key, val]) => {
        if (['createdAt', 'updatedAt'].includes(key)) {
            return;
        }

        cleanUpdateData[key] = val;
    });

    return await (trx || db).transaction(async (t) => {
        const scenario = await Scenario.query(t).patchAndFetchById(id, cleanUpdateData);
        if (!scenario) {
            throw new Error('Scenario not found');
        }

        // Handle instagram locations if provided
        if (instagramLocations !== undefined) {
            // Delete existing relationships
            await t('scenarioInstagramLocations').where({scenarioId: id}).del();

            // Add new relationships if any
            if (instagramLocations?.length) {
                const locationRows = instagramLocations.map(({id: instagramLocationId}) => ({
                    scenarioId: id,
                    instagramLocationId,
                }));

                await t('scenarioInstagramLocations').insert(locationRows);
            }
        }

        return scenario;
    });
}

export async function deleteScenario(
    params: DeleteScenarioParams,
    trx?: Transaction,
): Promise<DeleteScenarioResponse> {
    console.log('params', params);
    const deletedCount = await Scenario.query(trx || db).deleteById(params.id);
    return deletedCount;
}
