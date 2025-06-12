// Entry point for the application
// This file imports the app from app.ts and starts the server

import app from './app';
import { logger } from './utils/logger';
import dotenv from 'dotenv';
import { closeConnection } from './config/database';
import { PORT, NODE_ENV, IS_TEST } from './utils/constants';

// Ensure environment variables are loaded
dotenv.config();

// Only run the server if not in test environment
if (!IS_TEST) {
  // Log application startup
  logger.info('Starting application', {
    nodeEnv: NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memoryUsage: process.memoryUsage()
  });

  // Start the server
  try {
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        port: PORT,
        environment: NODE_ENV
      });
    });

    // Handle server errors
    server.on('error', (error: any) => {
      logger.error('Server error', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        errno: error.errno
      });

      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Please use a different port.`);
        process.exit(1);
      }
    });

    // Handle process termination
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received. Shutting down gracefully.');
      server.close(async () => {
        logger.info('Server closed.');
        await closeConnection();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received. Shutting down gracefully.');
      server.close(async () => {
        logger.info('Server closed.');
        await closeConnection();
        process.exit(0);
      });
    });

    // Handle uncaught exceptions and unhandled rejections
    process.on('uncaughtException', async (error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack
      });
      await closeConnection();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      logger.error('Unhandled rejection', {
        reason,
        promise
      });
      await closeConnection();
      process.exit(1);
    });
  } catch (error: any) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

export default app;
