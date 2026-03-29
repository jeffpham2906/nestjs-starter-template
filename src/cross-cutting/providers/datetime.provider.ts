import { Injectable, Scope } from '@nestjs/common';

export interface IDateTimeProvider {
  /**
   * Gets the current date and time
   * @returns The current Date object
   */
  now(): Date;
}

@Injectable({ scope: Scope.REQUEST })
export class DateTimeProvider implements IDateTimeProvider {
  now(): Date {
    return new Date();
  }
}
