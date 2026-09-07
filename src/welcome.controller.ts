import { Controller, Get } from '@nestjs/common';
import { WellcomeService } from './welcome.service.js';

@Controller()
export class WelcomeController {
  constructor(private readonly welcomeService: WelcomeService) {}

  @Get()
  getHello(): string {
    return this.welcomeService.getHello();
  }
}
