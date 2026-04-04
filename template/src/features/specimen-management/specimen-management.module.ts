import { Module } from '@nestjs/common';
import { CreateSpecimenModule } from './create-specimen/module';

@Module({
  imports: [CreateSpecimenModule],
})
export class SpecimenManagementModule {}
