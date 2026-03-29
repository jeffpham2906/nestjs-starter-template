import { DomainError } from '../../../../../shared/errors';

export class SpecimenNotFoundError extends DomainError {
  constructor(id: string) {
    super('SPECIMEN_NOT_FOUND', `Specified ${id} not found.`);
  }
}

export class SpecimenMappingError extends DomainError {
  constructor(reason: string, details?: Record<any, any>) {
    super(
      'SPECIMEN_MAPPING_ERROR',
      `Failed to map specimen data: ${reason}`,
      details,
    );
  }
}
