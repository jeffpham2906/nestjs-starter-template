import { CreateSpecimenCommand, CreateSpecimenCommandSchema } from './command';
import { err, ok, Result } from 'neverthrow';
import { ValidationError } from '../../../shared/errors';
import { Inject, Injectable } from '@nestjs/common';
import { CreateSpecimenProps } from '../_shared/domain/types/specimen.types';
import { IUuidProvider } from '../../../cross-cutting/providers/uuid.provider';
import { UserId } from '../../../shared/branded-types';
import { ILogger } from '../../../cross-cutting/logging/port/logger.port';
import { ILoggerFactory } from '../../../cross-cutting/logging/logger.factory';
import { ISpecimenCommandRepositoryPort } from '../_shared/infrastructure/ports/specimen.command-repository.port';
import { ISpecimenFactory } from '../_shared/domain/entities/specimen.factory';

export interface ICreateSpecimenUseCase {
  perform(
    command: CreateSpecimenCommand,
  ): Promise<Result<string, Error | ValidationError>>;
}

@Injectable()
export class CreateSpecimenUseCase implements ICreateSpecimenUseCase {
  private readonly logger: ILogger;
  constructor(
    @Inject(IUuidProvider)
    private readonly uuidProvider: IUuidProvider,
    @Inject(ISpecimenCommandRepositoryPort)
    private readonly commandRepo: ISpecimenCommandRepositoryPort,
    @Inject(ILoggerFactory)
    private readonly loggerFactory: ILoggerFactory,
    @Inject(ISpecimenFactory)
    private readonly specimenFactory: ISpecimenFactory,
  ) {
    this.logger = this.loggerFactory.createLoggerFromClass(
      CreateSpecimenUseCase,
    );
  }

  async perform(
    command: CreateSpecimenCommand,
  ): Promise<Result<string, Error | ValidationError>> {
    this.logger.log(`Creating specimen: ${command.name}`);
    const validatedCommand = CreateSpecimenCommandSchema.safeParse(command);
    if (!validatedCommand.success) {
      return Promise.resolve(
        err(new ValidationError('Invalid command', validatedCommand.error)),
      );
    }

    const createSpecimenProps: CreateSpecimenProps = {
      name: validatedCommand.data.name,
      userId: this.uuidProvider.generate() as UserId,
    };

    const specimen = this.specimenFactory.create(createSpecimenProps);

    if (specimen.isErr()) {
      return Promise.resolve(err(specimen.error));
    }
    await this.commandRepo.save(specimen.value);
    return Promise.resolve(ok(specimen.value.id));
  }
}
