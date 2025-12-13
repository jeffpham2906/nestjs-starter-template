import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiSecurity,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JWTGuard } from './guards/jwt';
import { ApiKeyGuard } from './guards/apiKey';

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
    decorators.push(UseGuards(JWTGuard));
    decorators.push(ApiBearerAuth());
  } else if (authType === AuthType.API_KEY) {
    decorators.push(UseGuards(ApiKeyGuard));
    decorators.push(ApiSecurity('api-key'));
    decorators.push(ApiSecurity('timestamp'));
    decorators.push(ApiSecurity('signature'));
  }

  return applyDecorators(...decorators);
}
