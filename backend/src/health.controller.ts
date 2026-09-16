import { Controller, Get } from '@nestjs/common';
import { gateInfo } from './chat/gate.provider';

@Controller('health')
export class HealthController {
  @Get()
  ok() {
    return { ok: true, gate: gateInfo() };
  }
}
