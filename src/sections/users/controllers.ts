import {Request, Response} from 'express';

import {createUser as dbCreateUser} from '../../db';

export async function createUser(req: Request, res: Response) {
    try {
        const {email, displayName, password} = req.body;

        if (!email) {
            res.status(400).json({error: 'Email is required'});
            return;
        }

        const user = await dbCreateUser({
            email,
            displayName,
            password,
        });

        res.status(201).json(user);
        return;
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({error: 'Failed to create user'});
        return;
    }
}
