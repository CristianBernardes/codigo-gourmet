import { Knex } from 'knex';
import path from 'path';
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, IS_DEVELOPMENT } from './source/utils/constants';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
    pool: {
      min: 2,
      max: 10,
    },
    debug: IS_DEVELOPMENT,
  },

  production: {
    client: 'mysql2',
    connection: {
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
    pool: {
      min: 2,
      max: 10,
    },
    debug: false,
  },

  test: {
    client: 'mysql2',
    connection: {
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: `${DB_NAME}_test`,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
    pool: {
      min: 2,
      max: 10,
    },
    debug: false,
  },
};

export default config;
