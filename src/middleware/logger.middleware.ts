import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const now = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      // Log the end of the request and duration
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${Date.now() - now}ms`,
      );
    });

    next();
  }
}
