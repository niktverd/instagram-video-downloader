// import {Request, Response} from 'express';

import {
    createScenario,
    deleteScenario,
    getAllScenarios,
    getScenarioById,
    updateScenario,
    wrapper,
} from '../../../db';

import {
    CreateScenarioParamsSchema,
    DeleteScenarioParamsSchema,
    GetAllScenariosParamsSchema,
    GetScenarioByIdParamsSchema,
    UpdateScenarioParamsSchema,
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
    UpdateScenarioParams,
    UpdateScenarioResponse,
} from '#types';

// import {logError} from '#utils';
// import {clearPreprod} from '$/shared';

export const getAllScenariosGet = wrapper<GetAllScenariosParams, GetAllScenariosResponse>(
    getAllScenarios,
    GetAllScenariosParamsSchema,
    'GET',
);

export const getScenarioByIdGet = wrapper<GetScenarioByIdParams, GetScenarioByIdResponse>(
    getScenarioById,
    GetScenarioByIdParamsSchema,
    'GET',
);

export const updateScenarioPatch = wrapper<UpdateScenarioParams, UpdateScenarioResponse>(
    updateScenario,
    UpdateScenarioParamsSchema,
    'PATCH',
);

export const createScenarioPost = wrapper<CreateScenarioParams, CreateScenarioResponse>(
    createScenario,
    CreateScenarioParamsSchema,
    'POST',
);

export const deleteScenarioDelete = wrapper<DeleteScenarioParams, DeleteScenarioResponse>(
    deleteScenario,
    DeleteScenarioParamsSchema,
    'DELETE',
);

// export const uiClearPreprod = async (req: Request, res: Response) => {
//     try {
//         await clearPreprod();
//         res.status(200).send(req.query);
//     } catch (error) {
//         logError(error);
//         console.log(error);
//         res.status(500).send(error);
//     }
// };

// export const uiRunInjectionScenraios = async (req: Request, res: Response) => {
//     res.status(200).send(req.query);
//     // await runInjectionScenraios();
// };
