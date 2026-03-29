import { Injectable } from '@nestjs/common';
import { LoggerFactory } from '../logging/logger.factory';
import { ILogger } from '../logging/port/logger.port';

@Injectable()
export class AccessControlService {
  private logger: ILogger;
  constructor(private readonly loggerFactory: LoggerFactory) {
    this.logger =
      this.loggerFactory.createLoggerFromClass(AccessControlService);
  }

  hasPermission(userId: string, permission: string): boolean {
    this.logger.log(`Access Control permission "${permission}"`);
    // Implement your permission logic here
    return false;
  }
}
