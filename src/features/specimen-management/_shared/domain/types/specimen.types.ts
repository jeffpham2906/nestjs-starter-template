import { z } from 'zod';
import { SpecimenId, UserId } from '../../../../../shared/branded-types';

const SpecimenBaseSchema = z.object({
  id: SpecimenId,
  name: z.string(),
});
export const CreateSpecimenSchema = SpecimenBaseSchema.extend({
  userId: UserId,
});
export type CreateSpecimenProps = z.infer<typeof CreateSpecimenSchema>;

export const UpdateSpecimenSchema = SpecimenBaseSchema.partial().extend({
  userId: UserId,
});
export type UpdateSpecimenProps = z.infer<typeof UpdateSpecimenSchema>;
