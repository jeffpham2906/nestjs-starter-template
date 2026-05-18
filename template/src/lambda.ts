/* eslint-disable */
// lambda.ts
import { NestFactory } from '@nestjs/core';
import type { Context, Handler } from 'aws-lambda';
import awsLambdaFastify from '@fastify/aws-lambda';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { setupSwagger } from '@shared/utils';

let cachedServer: Handler;

async function bootstrap() {
  if (!cachedServer) {
    const nestApp = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
    );

    nestApp.enableCors();
    setupSwagger(nestApp);

    await nestApp.init();

    cachedServer = awsLambdaFastify(nestApp.getHttpAdapter().getInstance());
  }

  return cachedServer;
}

export const handler = async (event: any, context: Context) => {
  const server = await bootstrap();
  return server(event, context);
};
