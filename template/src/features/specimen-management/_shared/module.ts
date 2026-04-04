import { Module } from '@nestjs/common';
import { SpecimenCommandRepositoryPrisma } from './infrastructure/adapters/specimen.command-repository.prisma';
import { ISpecimenCommandRepositoryPort } from './infrastructure/ports/specimen.command-repository.port';
import {
  ISpecimenFactory,
  SpecimenFactory,
} from './domain/entities/specimen.factory';

@Module({
  providers: [
    {
      provide: ISpecimenCommandRepositoryPort,
      useClass: SpecimenCommandRepositoryPrisma,
    },
    {
      provide: ISpecimenFactory,
      useClass: SpecimenFactory,
    },
  ],
  exports: [ISpecimenCommandRepositoryPort, ISpecimenFactory],
})
export class SpecimenManagementSharedModule {}
