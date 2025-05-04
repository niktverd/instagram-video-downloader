import {Request, Response} from 'express';

import {logError} from '#utils';
// import {runInjectionScenraios} from '$/cloud-run/components/scenarios';
import {addScenario, clearPreprod, getScenarios, patchScenario} from '$/shared';

export const uiGetScenarios = async (_req: Request, res: Response) => {
    try {
        const scenarios = await getScenarios();
        res.status(200).send(scenarios);
    } catch (error) {
        logError(error);
        console.log(error);
        res.status(500).send(error);
    }
};

export const uiPatchScenario = async (req: Request, res: Response) => {
    const {id, values} = req.body;
    await patchScenario({id, values});
    res.status(200).send(req.body);
};

export const uiAddScenario = async (req: Request, res: Response) => {
    const {id, values} = req.body;
    await addScenario({id, values});
    res.status(200).send(req.body);
};

export const uiClearPreprod = async (req: Request, res: Response) => {
    await clearPreprod();
    res.status(200).send(req.query);
};

export const uiRunInjectionScenraios = async (req: Request, res: Response) => {
    res.status(200).send(req.query);
    // await runInjectionScenraios();
};
