import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { logger } from './config/logger';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import visitorRoutes from './modules/visitor/visitor.routes';
import mediaRoutes from './modules/media/media.routes';
import { notificationWorker } from './modules/notification/notification.queue';

const app = express();
const PORT = process.env.PORT || 4000;

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'Accept'],
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for development testing
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

// Logging Middleware
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// API Routes
import adminRoutes from './modules/admin/admin.routes';
import entryRoutes from './modules/entry/entry.routes';

// ... existing code ...
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling
app.use(errorHandler);

// Background Worker Management (Deferred to avoid blocking startup)
const startWorkers = () => {
  try {
    notificationWorker.on('ready', () => {
      logger.info('Notification worker is ready and listening for jobs');
    });
    notificationWorker.on('error', (err) => {
      logger.error('Notification worker error:', err);
    });
  } catch (err) {
    logger.error('Failed to initialize notification worker:', err);
  }
};

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  logger.info(`🚀 KLB Connect Backend running on port ${PORT} (Bound to 0.0.0.0)`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  startWorkers();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Graceful shutdown logic here
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
