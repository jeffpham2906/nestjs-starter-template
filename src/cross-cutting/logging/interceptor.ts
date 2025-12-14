/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly requestLogger = new Logger('Request');
  private readonly responseLogger = new Logger('Response');
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const start = Date.now();

    this.logRequest(request);

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - start;
        const response = context.switchToHttp().getResponse<Response>();
        this.logResponse(response, data, duration);
      }),
    );
  }

  private logRequest(request: Request) {
    const loggedObject = {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
      body: request.body,
    };
    this.requestLogger.log(JSON.stringify(loggedObject, null, 2));
  }

  private logResponse(response: Response, body: any, duration: number) {
    const loggedObject = {
      statusCode: response.statusCode,
      duration: `${duration}ms`,
      body,
      // Add more response details if needed
    };
    this.responseLogger.log(JSON.stringify(loggedObject, null, 2));
  }
}
