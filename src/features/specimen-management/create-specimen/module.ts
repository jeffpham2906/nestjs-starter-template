import { Module } from '@nestjs/common';
import { CreateSpecimenController } from './controller';
import { CreateSpecimenUseCase } from './useCase';
import { SpecimenManagementSharedModule } from '../_shared/module';

@Module({
  imports: [SpecimenManagementSharedModule],
  controllers: [CreateSpecimenController],
  providers: [CreateSpecimenUseCase],
})
export class CreateSpecimenModule {}
