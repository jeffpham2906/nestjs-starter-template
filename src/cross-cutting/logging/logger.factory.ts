import { Injectable } from '@nestjs/common';
import { NestJSLoggerAdapter } from './adapters/nestjs-logger.adapter';
import { ILogger } from './interface/logger';

/**
 * Factory service for creating contextual logger instances.
 * Provides a way to create ILogger instances with specific context (class names).
 * Maintains compatibility with existing logging patterns while providing interface abstraction.
 */
@Injectable()
export class LoggerFactory {
  /**
   * Creates a logger instance with the specified context.
   * @param context The context name (typically the class name)
   * @returns ILogger instance configured with the provided context
   */
  createLogger(context: string): ILogger {
    return new NestJSLoggerAdapter(context);
  }

  /**
   * Creates a logger instance from a class constructor.
   * Automatically extracts the class name as context.
   * @param classConstructor The class constructor to extract name from
   * @returns ILogger instance configured with the class name as context
   */
  createLoggerFromClass<T>(
    classConstructor: new (...args: unknown[]) => T,
  ): ILogger {
    return new NestJSLoggerAdapter(classConstructor.name);
  }
}
