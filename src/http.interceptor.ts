import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http2';
import { tap } from 'rxjs';

const DEFAULT_ALLOWED_HEADERS = [
  'accept',
  'content-type',
  'user-agent',
  'authorization',
  'cookie',
  'origin',
];

const DEFAULT_SENSITIVE_HEADERS = ['authorization', 'cookie'];

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor() {}

  intercept(ctx: ExecutionContext, next: CallHandler) {
    const request = ctx.switchToHttp().getRequest<Request>();
    const start = Date.now();

    const log = request.log;
    log.info(
      this.redactSensitiveData({
        type: 'request',
        method: request.method,
        url: request.url,
        params: request.params,
        query: request.query,
        headers: this.standardizeHeaders(request.headers),
      }),
      'Request received',
    );
    return next.handle().pipe(
      tap(() => {
        log.info(
          this.redactSensitiveData({
            type: 'response',
            method: request.method,
            url: request.url,
            statusCode: request.res.statusCode,
            duration: Date.now() - start,
          }),
          'Request completed',
        );
      }),
    );
  }
  private standardizeHeaders(
    headers: IncomingHttpHeaders,
    allowedHeaders: string[] = DEFAULT_ALLOWED_HEADERS,
  ): Partial<IncomingHttpHeaders> {
    const result: Partial<IncomingHttpHeaders> = {};

    for (const key of allowedHeaders) {
      const value = headers[key.toLowerCase()];
      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  }

  private redactSensitiveData(
    input: unknown,
    options?: {
      sensitiveKeys?: readonly string[];
      maxDepth?: number;
    },
  ): unknown {
    const sensitiveKeys = (
      options?.sensitiveKeys ?? DEFAULT_SENSITIVE_HEADERS
    ).map((k) => k.toLowerCase());

    const maxDepth = options?.maxDepth ?? 5;
    const seen = new WeakSet<object>();

    const redact = (value: unknown, depth: number): unknown => {
      if (depth > maxDepth) {
        return '[MAX_DEPTH_REACHED]';
      }

      if (value === null || typeof value !== 'object') {
        return value;
      }

      if (seen.has(value)) {
        return '[CIRCULAR]';
      }

      seen.add(value);

      if (Array.isArray(value)) {
        return value.map((item) => redact(item, depth + 1));
      }

      const result: Record<string, unknown> = {};

      for (const [key, val] of Object.entries(value)) {
        if (sensitiveKeys.includes(key.toLowerCase())) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = redact(val, depth + 1);
        }
      }

      return result;
    };

    return redact(input, 0);
  }
}
