import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import appConfig from './config/app';
import { container } from './di/container';
import { errorMiddleware } from './middlewares/error.middleware';
import swaggerDefinition from '../swaggerDef';
import { API_PREFIX, API_VERSION } from './utils/constants';

// Load environment variables
dotenv.config();

// Initialize database
import './config/database';

// Create Express app
const app = appConfig;

// Initialize Swagger
const swaggerSpec = swaggerJSDoc(swaggerDefinition);

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
}));

// API routes
const apiPath = API_VERSION ? `${API_PREFIX}/${API_VERSION}` : API_PREFIX;
app.use(`${apiPath}/auth`, container.getAuthRouter());
app.use(`${apiPath}/categorias`, container.getCategoriasRouter());
app.use(`${apiPath}/receitas`, container.getReceitasRouter());

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Detailed health check endpoint with database connection test
app.get('/health/detailed', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: 'unknown'
    },
    memory: process.memoryUsage()
  };

  try {
    // Test database connection
    const knexInstance = require('./config/database').default;
    const result = await knexInstance.raw('SELECT 1 as dbIsUp');

    if (result && result[0] && result[0][0] && result[0][0].dbIsUp === 1) {
      health.database.status = 'ok';
    } else {
      health.database.status = 'error';
      health.status = 'error';
    }
  } catch (error: any) {
    health.database = {
      status: 'error',
      message: error.message,
      code: error.code,
      errno: error.errno
    };
    health.status = 'error';
  }

  const statusCode = health.status === 'ok' ? 200 : 500;
  res.status(statusCode).json(health);
});

// Simple test endpoint that bypasses most of the application logic
app.get('/test', (req, res) => {
  try {
    // Log the request
    const logger = require('./utils/logger').logger;
    logger.info('Test endpoint called', {
      headers: req.headers,
      query: req.query,
      ip: req.ip
    });

    // Return a simple response
    res.status(200).json({
      status: 'success',
      message: 'Test endpoint is working',
      timestamp: new Date(),
      requestInfo: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        headers: {
          userAgent: req.headers['user-agent'],
          contentType: req.headers['content-type'],
          accept: req.headers.accept
        },
        query: req.query
      }
    });
  } catch (error: any) {
    // If there's an error, log it and return a simple error response
    console.error('Error in test endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error in test endpoint',
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint não encontrado' });
});

// Error handler middleware
app.use(errorMiddleware);

// Server is started in index.ts

export default app;
