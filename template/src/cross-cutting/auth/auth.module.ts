import { Global, Module } from '@nestjs/common';
import { ClaimsHelper, IClaimsHelper } from './claims-helper';
import { AccessControlService } from './access-control.service';

@Global()
@Module({
  providers: [
    AccessControlService,
    {
      provide: IClaimsHelper,
      useClass: ClaimsHelper,
    },
  ],
  exports: [IClaimsHelper, AccessControlService],
})
export class AuthModule {}
