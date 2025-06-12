import knex, { Knex } from 'knex';
import { Model } from 'objection';
import config from '../../knexfile';
import { logger } from '../utils/logger';
import { NODE_ENV, IS_TEST } from '../utils/constants';

// Determine which environment we're in
const environment = NODE_ENV;

let knexInstance: Knex;

try {
  // Log database connection attempt
  logger.info(`Attempting to connect to database in ${environment} environment`, {
    host: config[environment].connection.host,
    database: config[environment].connection.database,
    user: config[environment].connection.user
  });

  // Initialize knex with the appropriate configuration
  knexInstance = knex(config[environment]);

  // Test the connection
  if (!IS_TEST) {
    knexInstance.raw('SELECT 1')
      .then(() => {
        logger.info('Database connection established successfully');
      })
      .catch((error) => {
        logger.error('Failed to establish database connection', {
          error: error.message,
          stack: error.stack,
          code: error.code,
          errno: error.errno,
          sqlState: error.sqlState,
          sqlMessage: error.sqlMessage
        });
      });
  }

  // Bind all Models to the knex instance
  Model.knex(knexInstance);
} catch (error: any) {
  logger.error('Error initializing database connection', {
    error: error.message,
    stack: error.stack,
    code: error.code,
    errno: error.errno,
    sqlState: error.sqlState,
    sqlMessage: error.sqlMessage
  });

  // Create a dummy knex instance that will throw errors when used
  knexInstance = knex({
    client: 'mysql2',
    connection: {
      host: 'localhost',
      user: 'dummy',
      password: 'dummy',
      database: 'dummy'
    }
  });
}

/**
 * Close the database connection
 * This function should be called when the application is shutting down
 * or when tests are being torn down
 */
export const closeConnection = async (): Promise<void> => {
  try {
    logger.info('Closing database connection');

    // Check if knexInstance is defined and has a destroy method
    if (knexInstance && typeof knexInstance.destroy === 'function') {
      await knexInstance.destroy();

      // Reset the knex instance on Objection models
      if (Model && typeof Model.knex === 'function') {
        Model.knex(null as any);
      }

      logger.info('Database connection closed successfully');
    } else {
      logger.info('No active database connection to close');
    }
  } catch (error: any) {
    logger.error('Error closing database connection', {
      error: error.message,
      stack: error.stack
    });
  }
};

export default knexInstance;
