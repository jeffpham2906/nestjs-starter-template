import { Specimen } from '../../domain/entities/specimen';
import { Result } from 'neverthrow';

export interface ISpecimenCommandRepositoryPort {
  save(specimen: Specimen): Promise<Result<void, Error>>;
}

export const ISpecimenCommandRepositoryPort = Symbol(
  'ISpecimenCommandRepositoryPort',
);
