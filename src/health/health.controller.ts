import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class HealthController {
  @Get()
  root() {
    return this.health();
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'Hospital Management API',
      version: '1.0.0',
      docs: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }
}
