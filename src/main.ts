import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { version } from '../package.json';
import { Logger } from 'nestjs-pino';
import { HttpLoggingInterceptor } from './http.interceptor';

async function bootstrap() {
  const app: INestApplication<AppModule> = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.flushLogs();
  const logger = app.get(Logger);

  app.useGlobalInterceptors(new HttpLoggingInterceptor());

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
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: 'swagger.json',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation available at: http://localhost:${port}/swagger`,
  );
}
void bootstrap();
