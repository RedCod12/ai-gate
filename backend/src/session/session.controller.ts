import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { gateInfo } from '../chat/gate.provider';

@Controller('session')
export class SessionController {
  @Get('me')
  me(@Req() req: Request) {
    return { id: req.sessionId, gate: gateInfo() };
  }
}
