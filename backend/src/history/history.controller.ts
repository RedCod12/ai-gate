import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly history: HistoryService) {}

  @Get()
  list(@Req() req: Request) {
    return this.history.list(req.sessionId);
  }
}
