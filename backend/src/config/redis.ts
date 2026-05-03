import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 5000);
    return delay;
  },
});

redisConnection.on('connect', () => {
  logger.info('Successfully connected to Redis');
});

redisConnection.on('error', (error) => {
  logger.error(`Redis connection error: ${error.message}`);
});
