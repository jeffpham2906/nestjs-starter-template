import { Injectable, Scope } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface IUuidProvider {
  /**
   * Generates a new UUID v4
   * @returns A new UUID string
   */
  generate(): string;
}

@Injectable({ scope: Scope.REQUEST })
export class UuidProvider implements IUuidProvider {
  generate(): string {
    return randomUUID();
  }
}
