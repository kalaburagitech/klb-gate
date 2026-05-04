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
const PORT = process.env.PORT || 5001;

// 1. Health Check (Top Priority for Railway)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 2. Logging & Security
app.use(morgan('dev'));
app.use(helmet({ 
  crossOriginResourcePolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// 3. Robust CORS Configuration
const allowedOrigins = [
  'https://klb-gate.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'Accept'],
  credentials: true,
}));

// 4. Rate Limiting (Moved down)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: 'Rate limit exceeded',
});
app.use('/api/', limiter);

// Logging Middleware
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



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
