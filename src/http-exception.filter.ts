import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { isObject, isString } from 'lodash';

interface ErrorResponse {
  reqId?: string;
  statusCode: number;
  host: string;
  origin: string;
  errorCode?: string;
  error: Record<string, any> | string;
  cause?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const isServerError = httpStatus >= 500 && httpStatus < 600;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const responseBody: ErrorResponse = {
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
      cause: exception instanceof HttpException ? exception.cause : undefined,
    };

    if (isServerError) {
      request.log.error(exception, 'Server error');
    } else {
      request.log.warn(exception, 'Response error');
    }

    httpAdapter.reply(
      ctx.getResponse(),
      this.removeSensitiveFields(responseBody),
      httpStatus,
    );
  }

  private removeSensitiveFields(errorResponse: ErrorResponse) {
    if (isObject(errorResponse.error)) {
      delete errorResponse.error.stack;
    }
    return errorResponse;
  }
}
