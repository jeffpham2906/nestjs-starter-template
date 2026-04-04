import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { ILoggerFactory } from '../../logging/logger.factory';
import { ILogger } from '../../logging/port/logger.port';
import { mapZodErrorToFieldAndFormErrors } from '../../../shared/zod-error.mapper';

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  private logger: ILogger;
  constructor(
    @Inject(ILoggerFactory)
    private readonly loggerFactory: ILoggerFactory,
  ) {
    this.logger = this.loggerFactory.createLoggerFromClass(
      ZodValidationException,
    );
  }

  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const requestContext = this.extractRequestContext(request);

    const zodError = exception.getZodError() as ZodError;
    const mappedErrors = mapZodErrorToFieldAndFormErrors(zodError);

    this.logger.warn('Zod validation failed', {
      context: requestContext,
      fieldErrors: mappedErrors.fieldErrors,
      formErrors: mappedErrors.formErrors,
      zodIssues: zodError.issues,
    });

    const responseBody = {
      statusCode: HttpStatus.BAD_REQUEST,
      message: zodError.message,
      fieldErrors: mappedErrors.fieldErrors,
      formErrors: mappedErrors.formErrors,
    };

    response.status(HttpStatus.BAD_REQUEST).send(responseBody);
  }

  private extractRequestContext(request: FastifyRequest) {
    return {
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString(),
    };
  }
}
