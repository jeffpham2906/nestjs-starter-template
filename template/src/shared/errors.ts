import { ZodError } from 'zod';
import { mapZodErrorToFieldAndFormErrors } from './zod-error.mapper';

export abstract class DomainError extends Error {
  protected constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  public readonly fieldErrors: Record<string, string[]>;
  public readonly formErrors: Array<string>;

  constructor(message: string, zodError?: ZodError) {
    super('ValidationError', message);
    const mappedErrors = mapZodErrorToFieldAndFormErrors(zodError);
    this.fieldErrors = mappedErrors.fieldErrors;
    this.formErrors = mappedErrors.formErrors;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      fieldErrors: this.fieldErrors,
      formErrors: this.formErrors,
    };
  }
}
