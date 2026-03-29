import { Specimen } from '../../domain/entities/specimen';
import { Result } from 'neverthrow';

export abstract class SpecimenCommandRepositoryPort {
  abstract save(specimen: Specimen): Promise<Result<void, Error>>;
}
