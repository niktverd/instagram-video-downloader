import {Request, Response} from 'express';

import {addAccount, getAccounts, patchAccount} from '#logic';
import {log, logError} from '#utils';

export const uiGetAccounts = async (_req: Request, res: Response) => {
    try {
        const accounts = await getAccounts();
        log(accounts);
        res.status(200).send(accounts);
    } catch (error) {
        log(error);
        logError(error);
        res.status(500).send(error);
    }
};

export const uiAddAccount = async (req: Request, res: Response) => {
    const {
        values: {id, token, availableScenarios},
    } = req.body;
    log(req.body, {id, values: {id, token, availableScenarios}});
    await addAccount({id, values: {id, token, disabled: false, availableScenarios}});
    res.status(200).send(req.body);
};

export const uiPatchAccount = async (req: Request, res: Response) => {
    const {id, values} = req.body;
    log(values);
    await patchAccount({id, values});
    res.status(200).send(req.body);
};
