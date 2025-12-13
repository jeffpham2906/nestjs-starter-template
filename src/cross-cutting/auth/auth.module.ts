import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JWTGuard } from './guards/jwt';
import { ApiKeyGuard } from './guards/apiKey';

@Module({
  providers: [AuthService, JWTGuard, ApiKeyGuard],
  exports: [AuthService, JWTGuard, ApiKeyGuard],
})
export class AuthModule {}
