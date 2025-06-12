import knex, { Knex } from 'knex';
import { Model } from 'objection';
import config from '../knexfile';
import { logger } from '../source/utils/logger';

// Get the test configuration
const testConfig = config.test;

// Create a knex instance for testing
export const knexInstance: Knex = knex(testConfig);

// Bind all Models to the knex instance
Model.knex(knexInstance);

/**
 * Set up the test database
 * This function should be called before running tests
 */
export const setupTestDatabase = async (): Promise<void> => {
  try {
    // First ensure the database is clean
    await teardownTestDatabase();

    // Run migrations to create tables
    if (knexInstance && typeof knexInstance.migrate?.latest === 'function') {
      await knexInstance.migrate.latest();
      logger.info('Test database migrations completed successfully');
    } else {
      logger.error('Cannot run migrations: knexInstance or migrate.latest is not available');
    }
  } catch (error: any) {
    logger.error('Error setting up test database', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Tear down the test database
 * This function should be called after running tests
 */
export const teardownTestDatabase = async (): Promise<void> => {
  try {
    // Roll back all migrations
    if (knexInstance && typeof knexInstance.migrate?.rollback === 'function') {
      await knexInstance.migrate.rollback(undefined, true);
      logger.info('Test database migrations rolled back successfully');
    } else {
      logger.error('Cannot rollback migrations: knexInstance or migrate.rollback is not available');
    }
  } catch (error: any) {
    logger.error('Error tearing down test database', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Close the database connection
 * This function should be called when tests are complete
 */
export const closeTestConnection = async (): Promise<void> => {
  try {
    if (knexInstance && typeof knexInstance.destroy === 'function') {
      await knexInstance.destroy();
      logger.info('Test database connection closed successfully');
    } else {
      logger.info('No active test database connection to close');
    }
  } catch (error: any) {
    logger.error('Error closing test database connection', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Setup global Jest hooks
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
  await closeTestConnection();
});