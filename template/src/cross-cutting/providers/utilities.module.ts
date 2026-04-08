import { Global, Module } from '@nestjs/common';
import { IUuidProvider, UuidProvider } from './uuid.provider';
import { DateTimeProvider, IDateTimeProvider } from './datetime.provider';
import { IEncryptionProvider, EncryptionProvider } from './encryption.provider';

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
    {
      provide: IEncryptionProvider,
      useClass: EncryptionProvider,
    },
  ],
  exports: [IUuidProvider, IDateTimeProvider, IEncryptionProvider],
})
export class UtilitiesModule {}
