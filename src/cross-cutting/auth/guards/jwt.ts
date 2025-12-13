import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthType } from 'src/cross-cutting/auth/jeffAuth';

@Injectable()
export class JWTGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authType = this.reflector.get<AuthType>(
      'AUTH_TYPE',
      context.getHandler(),
    );
    if (authType !== AuthType.JWT) {
      throw new UnauthorizedException();
    }
    return this.validateRequest(request);
  }
  private async validateRequest(request: Request): Promise<boolean> {
    console.log('JWT GUARD RUNNING');

    const [type, token] = (request.headers['authorization'] ?? '').split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
    // Add your token validation logic here
    return true;
  }
}
