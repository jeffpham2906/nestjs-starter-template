import { Global, Module } from '@nestjs/common';
import { IUuidProvider, UuidProvider } from './uuid.provider';
import { DateTimeProvider, IDateTimeProvider } from './datetime.provider';

@Global()
@Module({
  providers: [
    {
      provide: IUuidProvider,
      useClass: UuidProvider,
    },
    {
      provide: IDateTimeProvider,
      useClass: DateTimeProvider,
    },
  ],
  exports: [IUuidProvider, IDateTimeProvider],
})
export class UtilitiesModule {}
