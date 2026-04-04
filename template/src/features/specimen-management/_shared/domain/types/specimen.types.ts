import { z } from 'zod';
import { SpecimenId, UserId } from '../../../../../shared/branded-types';
import { AuditInfo } from 'src/shared/value-objects/audit-info';

export const SpecimenBaseSchema = z.object({
  id: SpecimenId,
  name: z.string(),
  createdAudit: z.instanceof(AuditInfo),
  updatedAudit: z.instanceof(AuditInfo),
});

export type SpecimenProps = z.infer<typeof SpecimenBaseSchema>;
export const CreateSpecimenSchema = z.object({
  name: SpecimenBaseSchema.shape.name,
  userId: UserId,
});
export type CreateSpecimenProps = z.infer<typeof CreateSpecimenSchema>;

export const UpdateSpecimenSchema = SpecimenBaseSchema.partial().extend({
  updatedAudit: z.instanceof(AuditInfo),
});
export type UpdateSpecimenProps = z.infer<typeof UpdateSpecimenSchema>;
