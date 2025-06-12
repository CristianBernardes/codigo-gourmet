import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, IS_PRODUCTION } from '../utils/constants';

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
  max: RATE_LIMIT_MAX_REQUESTS, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply rate limiting to all requests
app.use(apiLimiter);

export default app;
