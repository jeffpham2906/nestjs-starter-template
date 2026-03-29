import { Injectable } from '@nestjs/common';
import { SpecimenCommandRepositoryPort } from '../ports/specimen.command-repository.port';
import { PrismaService } from '../../../../../cross-cutting/db/prismaClient';
import { Specimen } from '../../domain/entities/specimen';
import { ok, Result } from 'neverthrow';
import { ILogger } from '../../../../../cross-cutting/logging/port/logger.port';
import { LoggerFactory } from '../../../../../cross-cutting/logging/logger.factory';

@Injectable()
export class SpecimenCommandRepositoryPrisma
  implements SpecimenCommandRepositoryPort
{
  private readonly logger: ILogger;
  constructor(
    private readonly prisma: PrismaService,
    private readonly loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.createLoggerFromClass(
      SpecimenCommandRepositoryPrisma,
    );
  }

  async save(specimen: Specimen): Promise<Result<void, Error>> {
    this.logger.debug(
      `Saving specimen with ID: ${specimen.id} and name: ${specimen.name}`,
    );
    console.log(specimen);
    return Promise.resolve(ok());
  }
}
