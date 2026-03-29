import { err, ok, Result } from 'neverthrow';
import {
  SpecimenResponseDto,
  SpecimenResponseSchema,
} from '../../dto/specimen.response.dto';
import { Injectable } from '@nestjs/common';
import { SpecimenMappingError } from '../../domain/errors/specimen.errors';

export type SpecimenReadData = {
  id: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
};

export interface ISpecimenQueryMapper {
  toResponse(
    record: SpecimenReadData,
  ): Result<SpecimenResponseDto, SpecimenMappingError>;
}

@Injectable()
export class SpecimenQueryMapper implements ISpecimenQueryMapper {
  toResponse(
    record: SpecimenReadData,
  ): Result<SpecimenResponseDto, SpecimenMappingError> {
    try {
      const parsedResult = SpecimenResponseSchema.safeParse({
        id: record.id,
        name: record.name,
        createdAt: record.createdAt,
        createdBy: record.createdBy,
      });
      if (!parsedResult.success) {
        return err(new SpecimenMappingError(''));
      }
      return ok(parsedResult.data);
    } catch (error) {
      return err(
        new SpecimenMappingError('Unexpected error during mapping', error),
      );
    }
  }
}
