import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';

const prisma = new PrismaClient({
  log: [
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ],
});

// @ts-ignore
prisma.$on('query', (e: any) => {
  // if (process.env.NODE_ENV === 'development') {
  //   logger.debug(`Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
  // }
});

export default prisma;
