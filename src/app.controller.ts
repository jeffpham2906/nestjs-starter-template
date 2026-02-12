import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthType, JeffAuth } from './cross-cutting/auth/jeffAuth';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/role.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @JeffAuth(AuthType.API_KEY)
  @Roles(Role.ADMIN, Role.USER)
  getHello(): string {
    return this.appService.getHello();
  }
}
