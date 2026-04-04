import { Result } from 'neverthrow';
import { SpecimenResponseDto } from '../../dto/specimen.response.dto';

export abstract class SpecimenQueryRepositoryPort {
  abstract findById(id: string): Promise<Result<SpecimenResponseDto, Error>>;
}
