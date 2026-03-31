import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../cross-cutting/db/prisma.module';
import { SpecimenCommandRepositoryPrisma } from './infrastructure/adapters/specimen.command-repository.prisma';
import { ISpecimenCommandRepositoryPort } from './infrastructure/ports/specimen.command-repository.port';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [
    {
      provide: ISpecimenCommandRepositoryPort,
      useClass: SpecimenCommandRepositoryPrisma,
    },
  ],
  exports: [ISpecimenCommandRepositoryPort],
})
export class SpecimenManagementSharedModule {}
