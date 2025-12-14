import { Logger } from '@nestjs/common';
import { ILogger } from '../interface/logger';
import { LoggerContext } from '../context';

/**
 * NestJS Logger adapter implementing ILogger interface.
 * Wraps NestJS Logger to provide interface-based logging compatible with NestJS LoggerService.
 * Maintains JSON format and Lambda compatibility.
 */
export class NestJSLoggerAdapter implements ILogger {
  private readonly nestLogger: Logger;

  constructor(context?: string) {
    this.nestLogger = new Logger(context || 'Application');
  }

  log(message: string, options: Record<string, any>): void {
    this.nestLogger.log(this.constructMessage(message, options));
  }

  error(message: string, options: Record<string, any>): void {
    this.nestLogger.error(this.constructMessage(message, options));
  }

  warn(message: string, options: Record<string, any>): void {
    this.nestLogger.warn(this.constructMessage(message, options));
  }

  debug(message: string, options: Record<string, any>): void {
    this.nestLogger.debug(this.constructMessage(message, options));
  }

  verbose(message: string, options: Record<string, any>): void {
    this.nestLogger.verbose(this.constructMessage(message, options));
  }

  private constructMessage(
    message: string,
    options: Record<string, any>,
  ): string {
    const context = LoggerContext.getContext();
    const { requestId, ...rest } = context ? Object.fromEntries(context) : {};

    const loggedObject = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      requestId,
      message,
      ...rest,
      ...options,
    };
    return JSON.stringify(loggedObject, null, 2);
  }
}
