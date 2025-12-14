import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { LoggerContext } from 'src/cross-cutting/logging/context';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const loggerContext = new LoggerContext();
    const context = new Map<string, any>();
    const requestId = req.headers['x-request-id'] || randomUUID();

    context.set('requestId', requestId);

    loggerContext.run(() => {
      this.logger.log('START_REQUEST_ID: ' + context.get('requestId'));
      next();
      res.on('finish', () => {
        this.logger.log('END_REQUEST_ID: ' + context.get('requestId'));
      });
    }, context);
  }
}
