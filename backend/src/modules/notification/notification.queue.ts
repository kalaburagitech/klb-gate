import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../../config/redis';
import { logger } from '../../config/logger';

const NOTIFICATION_QUEUE = 'notification_queue';

export const notificationQueue = new Queue(NOTIFICATION_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const notificationWorker = new Worker(
  NOTIFICATION_QUEUE,
  async (job: Job) => {
    const { userId, message, type } = job.data;
    logger.info(`Processing notification for user ${userId}: [${type}] ${message}`);
    
    // Simulate notification delivery
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return { success: true };
  },
  { connection: redisConnection }
);

notificationWorker.on('completed', (job) => {
  logger.info(`Notification job ${job.id} completed successfully`);
});

notificationWorker.on('failed', (job, err) => {
  logger.error(`Notification job ${job?.id} failed: ${err.message}`);
});
