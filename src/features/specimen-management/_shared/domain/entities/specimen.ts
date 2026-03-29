import {
  CreateSpecimenProps,
  CreateSpecimenSchema,
  UpdateSpecimenProps,
  UpdateSpecimenSchema,
} from '../types/specimen.types';
import { SpecimenId, UserId } from '../../../../../shared/branded-types';
import { err, ok, Result } from 'neverthrow';
import { ValidationError } from '../../../../../shared/errors';
import { AuditInfo } from '../../../../../shared/value-objects/audit-info';

export class Specimen {
  protected constructor(
    public readonly id: SpecimenId,
    public readonly name: string,
    public readonly createdAt?: AuditInfo,
    public readonly updatedAt?: AuditInfo,
  ) {}

  static create(
    props?: CreateSpecimenProps,
  ): Result<Specimen, ValidationError> {
    const validatedProps = CreateSpecimenSchema.parse(props);

    const userIdResult = this.createUserId(validatedProps.userId);
    if (userIdResult.isErr()) {
      return err(userIdResult.error);
    }

    const auditInfo = new AuditInfo(userIdResult.value);

    return ok(
      new Specimen(
        validatedProps.id,
        validatedProps.name,
        auditInfo,
        auditInfo,
      ),
    );
  }

  static createUserId(userId: string): Result<UserId, ValidationError> {
    const result = UserId.safeParse(userId);
    if (!result.success) {
      return err(
        new ValidationError(`Invalid user ID: ${userId}`, result.error),
      );
    }
    return ok(result.data);
  }

  static createSpecimenId(id: string): Result<SpecimenId, ValidationError> {
    const result = SpecimenId.safeParse(id);
    if (!result.success) {
      return err(
        new ValidationError(`Invalid specimen ID: ${id}`, result.error),
      );
    }
    return ok(result.data);
  }

  update(props: UpdateSpecimenProps) {
    const validatedProps = UpdateSpecimenSchema.parse(props);

    const userIdResult = Specimen.createUserId(validatedProps.userId);
    if (userIdResult.isErr()) {
      return err(userIdResult.error);
    }

    const auditInfo = new AuditInfo(userIdResult.value);
    return new Specimen(
      validatedProps.id,
      validatedProps.name,
      this.createdAt,
      auditInfo,
    );
  }
}
