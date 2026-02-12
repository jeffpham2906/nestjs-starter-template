import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor() {}
  getHello(): string {
    // this.logger.log(
    //   {
    //     function: 'getHello',
    //   },
    //   'getHello',
    // );
    // throw new Error('Test error');
    // throw new NotFoundException(
    //   {
    //     message: 'Resource not found',
    //     details: {
    //       resourceType: 'ExampleResource',
    //       resourceId: '12345',
    //     },
    //   },
    // {
    //   cause: 'Underlying cause of the error, if any',
    //   description: 'Detailed description of the error for debugging purposes',
    // },
    // );
    return 'Hello World!';
  }
}
