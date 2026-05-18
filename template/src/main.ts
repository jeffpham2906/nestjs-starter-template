import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ILogger } from './cross-cutting/logging/port/logger.port';
import { setupSwagger } from '@shared/utils';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const logger = app.get<ILogger>(ILogger);
  setupSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port).then(() => {
    logger.log(`Application is running on: http://localhost:${port}`);
  });
}
void bootstrap();
