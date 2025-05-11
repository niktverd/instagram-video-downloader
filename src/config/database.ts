import {Knex, knex} from 'knex';
import {Model} from 'objection';

import knexConfig from '../../knexfile';

type Environment = 'development' | 'server-production' | 'cloud-run';
const environment = (process.env.APP_ENV || 'development') as Environment;
const connectionConfig = knexConfig[environment] as Knex.Config;

// Initialize knex
const knexInstance: Knex = knex(connectionConfig);

// Bind all Models to the knex instance
Model.knex(knexInstance);

export default knexInstance;
