import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(private readonly logger: PinoLogger) {}
  getHello(): string {
    this.logger.info('AuthService.getHello called');
    return 'Hello from AuthService!';
  }
}
