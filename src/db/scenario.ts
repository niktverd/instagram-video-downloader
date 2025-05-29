import {Scenario} from '../models/Scenario';

import {CreateScenarioParamsSchema, UpdateScenarioParamsSchema} from '#schemas/handlers/scenario';
import {ApiFunctionPrototype} from '#src/types/common';
import {ThrownError} from '#src/utils/error';
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
    UpdateScenarioResponse,
} from '#types';

export const createScenario: ApiFunctionPrototype<
    CreateScenarioParams,
    CreateScenarioResponse
> = async (params, db) => {
    const validatedParams = CreateScenarioParamsSchema.parse(params);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scenarioData: Record<string, any> = {
        slug: validatedParams.slug,
        enabled: validatedParams.enabled ?? true,
        options: validatedParams.options || {},
        type: validatedParams.type,
    };

    if (typeof validatedParams.copiedFrom === 'number') {
        scenarioData.copiedFrom = validatedParams.copiedFrom;
    }

    const scenarioPromise = await db.transaction(async (t) => {
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

    return {
        result: scenarioPromise,
        code: 200,
    };
};

export const getScenarioById: ApiFunctionPrototype<
    GetScenarioByIdParams,
    GetScenarioByIdResponse
> = async (params, db) => {
    const scenario = await Scenario.query(db)
        .findById(params.id)
        .withGraphFetched('instagramLocations');

    if (!scenario) {
        throw new ThrownError('Scenario not found', 404);
    }

    return {
        result: scenario,
        code: 200,
    };
};

export const getScenarioBySlug: ApiFunctionPrototype<
    GetScenarioBySlugParams,
    GetScenarioBySlugResponse
> = async (params, db) => {
    const scenario = await Scenario.query(db)
        .where('slug', params.slug)
        .first()
        .withGraphFetched('instagramLocations');

    if (!scenario) {
        throw new ThrownError('Scenario not found', 404);
    }

    return {
        result: scenario,
        code: 200,
    };
};

export const getAllScenarios: ApiFunctionPrototype<
    GetAllScenariosParams,
    GetAllScenariosResponse
> = async (_params, db) => {
    const scenarios = await Scenario.query(db).withGraphFetched('instagramLocations');
    return {
        result: scenarios,
        code: 200,
    };
};

export const updateScenario: ApiFunctionPrototype<
    UpdateScenarioParams,
    UpdateScenarioResponse
> = async (params, db) => {
    const {id, instagramLocations, ...updateData} = UpdateScenarioParamsSchema.parse(params);

    // Create a clean update object without undefined/null values that might cause type issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanUpdateData: any = {};

    Object.entries(updateData).forEach(([key, val]) => {
        if (['createdAt', 'updatedAt'].includes(key)) {
            return;
        }

        cleanUpdateData[key] = val;
    });

    const scenarioPromise = await db.transaction(async (t) => {
        const scenario = await Scenario.query(t).patchAndFetchById(id, cleanUpdateData);
        if (!scenario) {
            throw new ThrownError('Scenario not found', 404);
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

    return {
        result: scenarioPromise,
        code: 200,
    };
};

export const deleteScenario: ApiFunctionPrototype<
    DeleteScenarioParams,
    DeleteScenarioResponse
> = async (params, db) => {
    console.log('params', params);
    const deletedCount = await Scenario.query(db).deleteById(params.id);
    return {
        result: deletedCount,
        code: 200,
    };
};
