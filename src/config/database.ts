import {Knex, knex} from 'knex';
import {Model} from 'objection';

import knexConfig from '../../knexfile';

const environment = process.env.APP_ENV || 'development';
const connectionConfig = knexConfig[environment];

// Initialize knex
const knexInstance: Knex = knex(connectionConfig);

// Bind all Models to the knex instance
Model.knex(knexInstance);

export default knexInstance;
