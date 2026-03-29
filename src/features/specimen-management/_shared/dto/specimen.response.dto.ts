import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const SpecimenResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  createdBy: z.string(),
  updatedAt: z.string(),
  updatedBy: z.string(),
});
export class SpecimenResponseDto extends createZodDto(SpecimenResponseSchema) {}
