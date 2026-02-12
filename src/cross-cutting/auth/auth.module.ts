import { Module } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { JWTGuard } from './guards/jwt';
import { ApiKeyGuard } from './guards/apiKey';

@Module({
  providers: [AccessControlService, JWTGuard, ApiKeyGuard],
  exports: [AccessControlService, JWTGuard, ApiKeyGuard],
})
export class AuthModule {}
