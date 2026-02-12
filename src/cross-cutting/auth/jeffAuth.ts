import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiSecurity,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JWTGuard } from './guards/jwt';
import { ApiKeyGuard } from './guards/apiKey';
import { RoleGuard } from './guards/role';

export enum AuthType {
  JWT = 'JWT',
  API_KEY = 'API_KEY',
}

export function JeffAuth(authType: AuthType = AuthType.JWT) {
  const decorators = [
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden' }),
  ];

  if (authType === AuthType.JWT) {
    decorators.push(UseGuards(JWTGuard, RoleGuard));
    decorators.push(ApiBearerAuth());
  } else if (authType === AuthType.API_KEY) {
    decorators.push(UseGuards(ApiKeyGuard, RoleGuard));
    decorators.push(ApiSecurity('api-key'));
    decorators.push(ApiSecurity('timestamp'));
    decorators.push(ApiSecurity('signature'));
  }

  return applyDecorators(...decorators);
}
