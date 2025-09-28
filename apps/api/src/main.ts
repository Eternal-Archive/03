import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { inferUserGeo, mapGeoToCrdbRegion } from './region.util';

// 示例：演示如何在请求生命周期里识别属地（用于后续业务落库时带上 crdb_region）
// 这里仅记录日志，不做真实 DB 写入。
async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  const port = Number(process.env.PORT ?? 3000);

  // 全局钩子（可换成拦截器/中间件）
  app.use((req: any, _res: any, next: any) => {
    const geo = inferUserGeo(req.headers);
    const regionKey = mapGeoToCrdbRegion(geo);
    (req as any).__userGeo = geo;
    (req as any).__crdbRegion = regionKey;
    next();
  });

  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`ea-api listening on ${port}`);
}
bootstrap();
