import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JWTGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

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
