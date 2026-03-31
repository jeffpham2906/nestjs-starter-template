import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { ILoggerFactory } from '../../../cross-cutting/logging/logger.factory';
import { ILogger } from '../../../cross-cutting/logging/port/logger.port';
import { CreateSpecimenRequestDto } from './request.dto';
import {
  CreateSpecimenResponse,
  CreateSpecimenResponseDto,
} from './response.dto';
import { createSuccessResponse } from '../../../shared/types';
import { ZodResponse } from 'nestjs-zod';
import { CreateSpecimenUseCase } from './useCase';
import { ValidationError } from '../../../shared/errors';

@Controller('specimen')
export class CreateSpecimenController {
  private readonly logger: ILogger;
  constructor(
    @Inject(ILoggerFactory)
    private readonly loggerFactory: ILoggerFactory,
    private readonly useCase: CreateSpecimenUseCase,
  ) {
    this.logger = loggerFactory.createLoggerFromClass(CreateSpecimenController);
  }

  @Post()
  @ZodResponse({
    status: HttpStatus.CREATED,
    description: 'Specimen created successfully',
    type: CreateSpecimenResponse,
  })
  async createSpecimen(
    @Body() body: CreateSpecimenRequestDto,
  ): Promise<CreateSpecimenResponseDto> {
    this.logger.log(
      `Received request to create specimen with data: ${JSON.stringify(body)}`,
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = await this.useCase.perform(body);
    if (result.isErr()) {
      const error = result.error;
      switch (true) {
        case error instanceof ValidationError:
          this.logger.warn(
            `Validation error while creating specimen: ${error.message}`,
          );
          throw new BadRequestException(error.message);
        default:
          this.logger.error(
            `Unknown error while creating specimen: ${error.message}`,
            error,
          );
          throw new InternalServerErrorException('An error occurred.');
      }
    }
    return createSuccessResponse(
      {
        id: result.value,
      },
      'Specimen created successfully',
    );
  }
}
