import { Injectable } from '@nestjs/common';
import { SpecimenQueryRepositoryPort } from '../ports/specimen.query-repository.port';
import { err, ok, Result } from 'neverthrow';
import { SpecimenResponseDto } from '../../dto/specimen.response.dto';
import {
  SpecimenQueryMapper,
  SpecimenReadData,
} from '../mappers/specimen.query-mapper';
import { LoggerFactory } from '../../../../../cross-cutting/logging/logger.factory';
import { ILogger } from '../../../../../cross-cutting/logging/port/logger.port';

@Injectable()
export class SpecimenQueryRepositoryPrisma
  implements SpecimenQueryRepositoryPort
{
  private readonly logger: ILogger;
  constructor(
    private readonly mapper: SpecimenQueryMapper,
    private readonly loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.createLoggerFromClass(
      SpecimenQueryRepositoryPrisma,
    );
  }
  async findById(id: string): Promise<Result<SpecimenResponseDto, Error>> {
    this.logger.debug(`Finding specimen with ID: ${id}`);
    const mockData: SpecimenReadData = {
      id: '123',
      name: 'Test',
      createdBy: '123',
      updatedAt: new Date(),
      createdAt: new Date(),
      updatedBy: '123',
    };

    const specimenResult = this.mapper.toResponse(mockData);
    if (specimenResult.isErr()) {
      return Promise.resolve(err(specimenResult.error));
    }
    return Promise.resolve(ok(specimenResult.value));
  }
}
