import { createApiResponseDto } from '../../../shared/types';
import { SpecimenResponseSchema } from '../_shared/dto/specimen.response.dto';
import { z } from 'zod';

export const CreateSpecimenResponse = createApiResponseDto(
  SpecimenResponseSchema.pick({
    id: true,
  }),
);
export type CreateSpecimenResponseDto = z.infer<
  typeof CreateSpecimenResponse.schema
>;
