import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// import { AuthType, JeffAuth } from './cross-cutting/auth/jeffAuth';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // @JeffAuth(AuthType.API_KEY)
  getHello(): string {
    return this.appService.getHello();
  }
}
