import { Global, Module } from '@nestjs/common';
import { UuidProvider } from './uuid.provider';
import { DateTimeProvider } from './datetime.provider';

@Global()
@Module({
  providers: [UuidProvider, DateTimeProvider],
  exports: [UuidProvider, DateTimeProvider],
})
export class UtilitiesModule {}
