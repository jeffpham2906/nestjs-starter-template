import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { isObject } from 'lodash';

interface ErrorResponse {
  reqId?: string;
  statusCode: number;
  path: string;
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
    const request = ctx.getRequest<Request>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const responseBody: ErrorResponse = {
      statusCode: httpStatus,
      path: request.url,
      errorCode:
        exception instanceof HttpException
          ? exception.name
          : 'InternalServerError',
      error:
        typeof errorResponse === 'string'
          ? { message: errorResponse, name: 'Error' }
          : errorResponse,
      cause: exception instanceof HttpException ? exception.cause : undefined,
    };

    request.log.error(
      Object.assign(exception, { responseBody }),
      'Response error',
    );

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
