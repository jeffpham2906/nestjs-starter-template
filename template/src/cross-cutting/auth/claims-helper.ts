import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { JWTPayload } from 'jose';

export interface IClaimsHelper {
  getUserId(): string | null;
}

export const IClaimsHelper = Symbol('IClaimsHelper');

export interface AuthenticatedRequest extends FastifyRequest {
  user?: JWTPayload & {
    email?: string;
    roles?: string[];
  };
}

@Injectable({ scope: Scope.REQUEST })
export class ClaimsHelper implements IClaimsHelper {
  constructor(
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
  ) {}

  getUserId(): string {
    const user = this.request.user;
    return user.sub;
  }
}
