import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import urlRoutes from './routes/urlRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { redirectUrl } from './controllers/redirectController.js';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Turn off CSP for dev convenience if using inline scripts/assets
    crossOriginEmbedderPolicy: false,
  })
);

// Enable CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: { success: false, error: 'Too many attempts. Please try again after 5 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const shortenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { success: false, error: 'Too many URL requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Root test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is healthy and running.' });
});

// Auth Routes (rate limited)
app.use('/api/auth', authLimiter, authRoutes);

// URL Shortener CRUD Routes (rate limited)
app.use('/api/url', shortenLimiter, urlRoutes);

// Analytics Routes
app.use('/api/analytics', analyticsRoutes);

// Short code Redirection route
app.get('/:shortCode', redirectUrl);

// 404 Route handler for JSON API
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Base URL is configured as: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});

export default app;
