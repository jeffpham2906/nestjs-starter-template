import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createSpecimenRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});
export class CreateSpecimenRequestDto extends createZodDto(
  createSpecimenRequestSchema,
) {}
