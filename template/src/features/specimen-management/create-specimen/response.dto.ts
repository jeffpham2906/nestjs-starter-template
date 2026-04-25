import { createZodDto } from 'nestjs-zod';
import { SpecimenResponseSchema } from '../_shared/dto/specimen.response.dto';
import { z } from 'zod';

const createSpecimenResponseSchema = z.object({
  message: z.string().describe('Response message'),
  status: z.literal('success').describe('Response status'),
  data: SpecimenResponseSchema.pick({
    id: true,
  }),
});

export class CreateSpecimenResponse extends createZodDto(
  createSpecimenResponseSchema,
) {}

export type CreateSpecimenResponseDto = z.infer<
  typeof createSpecimenResponseSchema
>;
