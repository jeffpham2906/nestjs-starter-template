import { Module } from '@nestjs/common';
import { CreateSpecimenModule } from './create-specimen/module';
import { SpecimenManagementSharedModule } from './_shared/module';

@Module({
  imports: [CreateSpecimenModule, SpecimenManagementSharedModule],
})
export class SpecimenManagementModule {}
