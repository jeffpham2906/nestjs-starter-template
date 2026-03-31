import { Global, Module } from '@nestjs/common';
import { LoggerFactory } from './logger.factory';
import { ILogger } from './port/logger.port';

@Global()
@Module({
  providers: [
    LoggerFactory,
    {
      provide: ILogger,
      useFactory: (loggerFactory: LoggerFactory) => {
        return loggerFactory.createLogger('Application');
      },
      inject: [LoggerFactory],
    },
  ],
  exports: [LoggerFactory],
})
export class LoggingModule {}
