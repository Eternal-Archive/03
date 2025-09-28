import { Controller, Get } from '@nestjs/common';
import { prisma, redis } from './integrations';
import { trace } from '@opentelemetry/api';

@Controller()
export class AppController {
  @Get('/')
  root() {
    return { name: 'Eternal Archive API', env: process.env.APP_ENV ?? 'dev' };
  }

  @Get('/health')
  health() {
    const span = trace.getTracer('default').startSpan('custom.health');
    span.end();
    return { status: 'OK', ts: new Date().toISOString() };
  }

  @Get('/db/ping')
  async dbPing() {
    const r = await prisma.$queryRawUnsafe('SELECT 1');
    return { ok: true, r };
  }

  @Get('/redis/ping')
  async redisPing() {
    const pong = await redis.ping();
    return { pong };
  }

  @Get('/sentry/test')
  sentryTest() {
    throw new Error('sentry test');
  }
}
