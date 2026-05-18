import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { version } from '../../package.json';
import { cleanupOpenApiDoc } from 'nestjs-zod';

export const setupSwagger = (application: NestFastifyApplication) => {
  const config = new DocumentBuilder()
    .setTitle('NestJS Starter API')
    .setDescription(
      'API documentation for the NestJS Starter (Fastify + Prisma + Zod).',
    )
    .setVersion(version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(application, config);

  SwaggerModule.setup('swagger', application, cleanupOpenApiDoc(document), {
    jsonDocumentUrl: 'swagger.json',
  });
};
