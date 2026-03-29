/**
 * Logger ports interface for abstracting logging implementation.
 * Follows ports and adapters pattern to keep domain clean of infrastructure dependencies.
 * Compatible with NestJS LoggerService interface.
 */
export interface ILogger {
  /**
   * Write a 'log' level log.
   * @param message The message to log
   * @param optionalParams Optional additional parameters (context, metadata, etc.)
   */
  log(message: any, ...optionalParams: any[]): void;

  /**
   * Write an 'error' level log.
   * @param message The error message to log
   * @param optionalParams Optional additional parameters (stack trace, context, etc.)
   */
  error(message: any, ...optionalParams: any[]): void;

  /**
   * Write a 'warn' level log.
   * @param message The warning message to log
   * @param optionalParams Optional additional parameters (context, metadata, etc.)
   */
  warn(message: any, ...optionalParams: any[]): void;

  /**
   * Write a 'debug' level log.
   * @param message The debug message to log
   * @param optionalParams Optional additional parameters (context, metadata, etc.)
   */
  debug(message: any, ...optionalParams: any[]): void;

  /**
   * Write a 'verbose' level log.
   * @param message The verbose message to log
   * @param optionalParams Optional additional parameters (context, metadata, etc.)
   */
  verbose(message: any, ...optionalParams: any[]): void;
}
