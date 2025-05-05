import {Router as expressRouter} from 'express';

import {createUser} from './controllers';

const router = expressRouter();

router.post('/', createUser);

export default router;
