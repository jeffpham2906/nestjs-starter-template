import { CreateSpecimenCommand, CreateSpecimenCommandSchema } from './command';
import { err, ok, Result } from 'neverthrow';
import { ValidationError } from '../../../shared/errors';
import { Inject, Injectable } from '@nestjs/common';
import { CreateSpecimenProps } from '../_shared/domain/types/specimen.types';
import { IUuidProvider } from '../../../cross-cutting/providers/uuid.provider';
import { Specimen } from '../_shared/domain/entities/specimen';
import { UserId } from '../../../shared/branded-types';
import { ILogger } from '../../../cross-cutting/logging/port/logger.port';
import { ILoggerFactory } from '../../../cross-cutting/logging/logger.factory';
import { ISpecimenCommandRepositoryPort } from '../_shared/infrastructure/ports/specimen.command-repository.port';

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
    private readonly repository: ISpecimenCommandRepositoryPort,
    @Inject(ILoggerFactory)
    private readonly loggerFactory: ILoggerFactory,
  ) {
    this.logger = loggerFactory.createLoggerFromClass(CreateSpecimenUseCase);
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

    const specimenIdResult = Specimen.createSpecimenId(
      this.uuidProvider.generate(),
    );
    if (specimenIdResult.isErr()) {
      return Promise.resolve(err(specimenIdResult.error));
    }
    const createSpecimenProps: CreateSpecimenProps = {
      id: specimenIdResult.value,
      name: validatedCommand.data.name,
      userId: this.uuidProvider.generate() as UserId,
    };

    const specimen = Specimen.create(createSpecimenProps);

    if (specimen.isErr()) {
      return Promise.resolve(err(specimen.error));
    }
    await this.repository.save(specimen.value);
    return Promise.resolve(ok(specimen.value.id));
  }
}
