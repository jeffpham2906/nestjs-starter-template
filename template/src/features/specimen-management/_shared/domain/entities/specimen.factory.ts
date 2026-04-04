import { Inject, Injectable } from '@nestjs/common';
import { Specimen } from './specimen';
import { err, ok, Result } from 'neverthrow';
import { ValidationError } from 'src/shared/errors';
import {
  CreateSpecimenProps,
  CreateSpecimenSchema,
} from '../types/specimen.types';
import { SpecimenId, UserId } from 'src/shared/branded-types';
import { ILoggerFactory } from 'src/cross-cutting/logging/logger.factory';
import { ILogger } from 'src/cross-cutting/logging/port/logger.port';
import { AuditInfo } from 'src/shared/value-objects/audit-info';
import { IUuidProvider } from 'src/cross-cutting/providers/uuid.provider';
import { IDateTimeProvider } from 'src/cross-cutting/providers/datetime.provider';

export interface ISpecimenFactory {
  create(
    createSpecimenProps: CreateSpecimenProps,
  ): Result<Specimen, ValidationError>;
}

export const ISpecimenFactory = Symbol('ISpecimenFactory');

@Injectable()
export class SpecimenFactory implements ISpecimenFactory {
  private readonly logger: ILogger;
  constructor(
    @Inject(ILoggerFactory)
    private readonly loggerFactory: ILoggerFactory,
    @Inject(IUuidProvider)
    private readonly uuidProvider: IUuidProvider,
    @Inject(IDateTimeProvider)
    private readonly dateTimeProvider: IDateTimeProvider,
  ) {
    this.logger = this.loggerFactory.createLoggerFromClass(SpecimenFactory);
  }

  create(
    createSpecimenProps: CreateSpecimenProps,
  ): Result<Specimen, ValidationError> {
    const validatedProps = CreateSpecimenSchema.safeParse(createSpecimenProps);
    if (!validatedProps.success) {
      return err(
        new ValidationError(
          'Invalid properties for creating a specimen',
          validatedProps.error,
        ),
      );
    }
    const userIdResult = this.createUserId(validatedProps.data.userId);
    if (userIdResult.isErr()) {
      return err(userIdResult.error);
    }

    const now = this.dateTimeProvider.now();
    const specimenId = this.createSpecimenId(this.uuidProvider.generate());
    if (specimenId.isErr()) {
      return err(specimenId.error);
    }
    const auditInfo = new AuditInfo(userIdResult.value, now);

    const specimen = new Specimen({
      id: specimenId.value,
      name: validatedProps.data.name,
      createdAudit: auditInfo,
      updatedAudit: auditInfo,
    });

    return ok(specimen);
  }

  private createSpecimenId(id: string): Result<SpecimenId, ValidationError> {
    const result = SpecimenId.safeParse(id);
    if (!result.success) {
      this.logger.error(`Generated invalid specimen ID: ${id}`, {
        errors: result.error,
      });
      return err(
        new ValidationError(
          `Generated invalid specimen ID: ${id}`,
          result.error,
        ),
      );
    }
    return ok(result.data);
  }

  private createUserId(userId: string): Result<UserId, ValidationError> {
    const result = UserId.safeParse(userId);
    if (!result.success) {
      return err(
        new ValidationError(`Invalid user ID: ${userId}`, result.error),
      );
    }
    return ok(result.data);
  }
}
