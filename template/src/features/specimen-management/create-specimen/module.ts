import { Module } from '@nestjs/common';
import { CreateSpecimenController } from './controller';
import { CreateSpecimenUseCase, ICreateSpecimenUseCase } from './useCase';
import { SpecimenManagementSharedModule } from '../_shared/module';

@Module({
  imports: [SpecimenManagementSharedModule],
  controllers: [CreateSpecimenController],
  providers: [
    {
      provide: ICreateSpecimenUseCase,
      useClass: CreateSpecimenUseCase,
    },
  ],
})
export class CreateSpecimenModule {}
