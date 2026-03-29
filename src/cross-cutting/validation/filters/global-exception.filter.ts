import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { isString } from 'lodash';
import { LoggerFactory } from '../../logging/logger.factory';
import { ILogger } from '../../logging/port/logger.port';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger: ILogger;
  constructor(private readonly loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLoggerFromClass(GlobalExceptionFilter);
  }

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const requestContext = this.extractHeaders(request);
    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const responseBody = {
      statusCode: httpStatus,
      host: request.host,
      origin: request.originalUrl,
      errorCode:
        exception instanceof HttpException
          ? exception.name
          : 'InternalServerError',
      error: isString(errorResponse)
        ? { message: errorResponse, name: 'Error' }
        : errorResponse,
    };

    this.logger.error({
      context: requestContext,
      error: exception,
      errorName: exception instanceof Error ? exception.name : 'Unknown',
      errorMessage:
        exception instanceof Error ? exception.message : String(exception),
    });

    response.status(httpStatus).send(responseBody);
  }

  private extractHeaders(request: FastifyRequest) {
    return {
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString(),
    };
  }
}
