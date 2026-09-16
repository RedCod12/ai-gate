import { BadRequestException, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('stream')
  async stream(@Req() req: Request, @Res() res: Response) {
    const prompt = String((req.body as { prompt?: string })?.prompt ?? '').trim();
    if (!prompt) throw new BadRequestException('prompt required');
    if (prompt.length > 8000) throw new BadRequestException('prompt too long');

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (payload: unknown) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    try {
      const gen = this.chat.reply(req.sessionId, prompt);
      let next = await gen.next();
      while (!next.done) {
        send({ delta: next.value });
        next = await gen.next();
      }
      send({ done: true, message: next.value });
    } catch (err) {
      send({ error: err instanceof Error ? err.message : 'gate error' });
    } finally {
      res.end();
    }
  }
}
