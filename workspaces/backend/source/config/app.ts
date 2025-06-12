import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, IS_PRODUCTION, IS_TEST } from '../utils/constants';
import { container } from '../di/container';
import { errorMiddleware } from '../middlewares/error.middleware';

dotenv.config();

// Create Express app
const app = express();

// Basic security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: IS_PRODUCTION 
    ? ['https://codigo-gourmet.com', 'https://www.codigo-gourmet.com'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
app.use(morgan(IS_PRODUCTION ? 'combined' : 'dev'));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: IS_TEST ? 1000 : RATE_LIMIT_MAX_REQUESTS, // Higher limit for tests
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests from this IP, please try again after 15 minutes'
    });
  }
});

// Apply rate limiting to all requests
app.use(apiLimiter);

// Register API routes
app.use('/api/auth', container.getAuthRouter());
app.use('/api/categorias', container.getCategoriasRouter());
app.use('/api/receitas', container.getReceitasRouter());

// Register error handling middleware (must be after all routes)
app.use(errorMiddleware);

export default app;
