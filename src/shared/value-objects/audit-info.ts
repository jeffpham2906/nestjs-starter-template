import { UserId } from '../branded-types';

export class AuditInfo {
  public readonly userId: UserId;
  public readonly timestamp: Date;

  constructor(userId: UserId, timestamp?: Date) {
    this.userId = userId;
    this.timestamp = timestamp ?? new Date();
  }

  equals(other: AuditInfo) {
    return (
      this.userId === other.userId &&
      this.timestamp.getTime() === other.timestamp.getTime()
    );
  }
}
