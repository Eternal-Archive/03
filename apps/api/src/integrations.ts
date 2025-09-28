import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';

export const prisma = new PrismaClient();

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
