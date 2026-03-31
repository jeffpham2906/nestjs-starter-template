import { Global, Module } from '@nestjs/common';
import { ILoggerFactory, LoggerFactory } from './logger.factory';
import { ILogger } from './port/logger.port';

@Global()
@Module({
  providers: [
    LoggerFactory,
    {
      provide: ILoggerFactory,
      useClass: LoggerFactory,
    },
    {
      provide: ILogger,
      useFactory: (loggerFactory: LoggerFactory) => {
        return loggerFactory.createLogger('Application');
      },
      inject: [LoggerFactory],
    },
  ],
  exports: [ILoggerFactory, ILogger],
})
export class LoggingModule {}
