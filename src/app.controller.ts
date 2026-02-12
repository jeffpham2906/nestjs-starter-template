import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// import { ApiNotFoundResponse } from '@nestjs/swagger';
// import { ErrorResponse } from './app.contract';
import { AuthType, JeffAuth } from './cross-cutting/auth/jeffAuth';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/role.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @JeffAuth(AuthType.API_KEY)
  @Roles(Role.ADMIN, Role.USER)
  // @ApiNotFoundResponse({ type: ErrorResponse })
  getHello(): string {
    return this.appService.getHello();
  }
}
