import { Controller, Get } from '@nestjs/common';

@Controller('hello-world')
export class HelloWorldController {
  @Get()
  getHello() {
    return `Hello World!`;
  }
}
