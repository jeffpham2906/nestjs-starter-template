import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLE_KEY } from 'src/cross-cutting/auth/decorators/roles.decorator';
import { Role } from 'src/cross-cutting/auth/enums/role.enum';
import { AccessControlService } from '../access-control.service';
import { FastifyRequest } from 'fastify';

export class TokenDto {
  id: string;
  role: Role;
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private accessControlService: AccessControlService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = request['token'] as TokenDto;

    for (const role of requiredRoles) {
      const result = this.accessControlService.hasPermission(token?.id, role);

      if (result) {
        return true;
      }
    }

    return false;
  }
}
