import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';

// Utilities
import logger from './utils/logger.js';
import { connectDB } from './db/connection.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Set up middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('combined')); // HTTP request logger

// Logger middleware - API rotalarından ÖNCE yerleştirildi
app.use((req, res, next) => {
  logger.info(`İstek alındı: ${req.originalUrl}`);
  next();
});

// Basit test end-point'i
app.get('/api/carousel', (req, res) => {
  logger.info('Carousel API çağrıldı');
  res.status(200).json({ 
    success: true, 
    message: 'Carousel API çalışıyor', 
    data: [] 
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is up and running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    endpoint: req.originalUrl
  });
});

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    // Connect to the database
    await connectDB();
    logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err);
  // Close server & exit process
  process.exit(1);
});

export default app; 