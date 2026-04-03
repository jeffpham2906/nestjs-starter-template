import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { version } from '../package.json';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ILogger } from './cross-cutting/logging/port/logger.port';
import { cleanupOpenApiDoc } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const logger = app.get<ILogger>(ILogger);
  const config = new DocumentBuilder()
    .setTitle('<Project Name> API')
    .setDescription('API documentation for the <Project Name>.')
    .setVersion(version)
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
      'api-key',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-timestamp',
        in: 'header',
      },
      'timestamp',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-signature',
        in: 'header',
      },
      'signature',
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, cleanupOpenApiDoc(document), {
    jsonDocumentUrl: 'swagger.json',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port).then(() => {
    logger.log(`Application is running on: http://localhost:${port}`);
  });
}
void bootstrap();
