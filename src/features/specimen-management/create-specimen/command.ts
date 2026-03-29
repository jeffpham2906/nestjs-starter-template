import { z } from 'zod';

export const CreateSpecimenCommandSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type CreateSpecimenCommand = z.infer<typeof CreateSpecimenCommandSchema>;
