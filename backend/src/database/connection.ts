import knex from 'knex';
import { dbConfig } from '../config';

const database = knex({
  client: 'pg', // PostgreSQL
  connection: {
    host: dbConfig.host,
    port: dbConfig.port as number,
    database: dbConfig.database,
    user: dbConfig.username,
    password: dbConfig.password,
  },
  migrations: {
    directory: './src/database/migrations',
    extension: 'ts'
  }
});

export default database;