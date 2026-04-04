import { Logger } from '@nestjs/common';
import { ILogger } from '../port/logger.port';

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

  log(message: any, ...optionalParams: any[]): void {
    this.nestLogger.log(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]): void {
    this.nestLogger.error(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.nestLogger.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]): void {
    this.nestLogger.debug(message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]): void {
    this.nestLogger.verbose(message, ...optionalParams);
  }
}
