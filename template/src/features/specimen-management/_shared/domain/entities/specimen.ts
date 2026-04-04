import {
  SpecimenBaseSchema,
  SpecimenProps,
  UpdateSpecimenProps,
  UpdateSpecimenSchema,
} from '../types/specimen.types';
import { SpecimenId } from '../../../../../shared/branded-types';
import { err, ok } from 'neverthrow';
import { ValidationError } from '../../../../../shared/errors';
import { AuditInfo } from '../../../../../shared/value-objects/audit-info';

export class Specimen {
  public readonly id: SpecimenId;
  public readonly name: string;
  public readonly createdAudit: AuditInfo;
  public readonly updatedAudit: AuditInfo;

  constructor(props?: SpecimenProps) {
    if (!props) {
      return;
    }

    const validatedPropsResult = SpecimenBaseSchema.safeParse(props);
    if (!validatedPropsResult.success) {
      throw new ValidationError(
        'Invalid properties for creating a specimen',
        validatedPropsResult.error,
      );
    }
    this.id = validatedPropsResult.data.id;
    this.name = validatedPropsResult.data.name;
    this.createdAudit = validatedPropsResult.data.createdAudit;
    this.updatedAudit = validatedPropsResult.data.updatedAudit;
  }

  update(props: UpdateSpecimenProps) {
    const validatedProps = UpdateSpecimenSchema.safeParse(props);
    if (!validatedProps.success) {
      return err(
        new ValidationError(
          'Invalid properties for updating a specimen',
          validatedProps.error,
        ),
      );
    }

    return ok(
      new Specimen({
        id: this.id,
        name: validatedProps.data.name ?? this.name,
        createdAudit: this.createdAudit,
        updatedAudit: validatedProps.data.updatedAudit ?? this.updatedAudit,
      }),
    );
  }
}
