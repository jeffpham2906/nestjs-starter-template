import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { version } from '../package.json';
import { HttpExceptionFilter } from './http-exception.filter';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { FastifyLoggerOptions, RawServerDefault } from 'fastify';
import { PinoLoggerOptions } from 'fastify/types/logger';
import { randomUUID } from 'crypto';

const envToLogger: Record<
  string,
  (FastifyLoggerOptions<RawServerDefault> & PinoLoggerOptions) | boolean
> = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
};

const generalLoggerOptions: FastifyLoggerOptions<RawServerDefault> &
  PinoLoggerOptions = {
  redact: [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.headers.set-cookie',
  ],
};

const requestIdHeader = 'x-request-id';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger:
        Object.assign(
          envToLogger[process.env.NODE_ENV],
          generalLoggerOptions,
        ) ?? true,
      requestIdHeader,
      genReqId(req) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return (req.headers[requestIdHeader] as string) || randomUUID();
      },
    }),
  );
  app.flushLogs();

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapter));

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
}
void bootstrap();
