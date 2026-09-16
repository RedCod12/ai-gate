import { Injectable } from '@nestjs/common';
import { HistoryService } from '../history/history.service';
import { gateInfo, streamCompletion } from './gate.provider';

@Injectable()
export class ChatService {
  constructor(private readonly history: HistoryService) {}

  info() {
    return gateInfo();
  }

  async *reply(sessionId: string, prompt: string) {
    const past = await this.history.context(sessionId);
    const context = past
      .reverse()
      .map((m) => ({ role: m.role, content: m.content }));

    await this.history.add(sessionId, 'user', prompt);

    let acc = '';
    for await (const delta of streamCompletion(prompt, context)) {
      acc += delta;
      yield delta;
    }

    const assistant = await this.history.add(sessionId, 'assistant', acc);
    return assistant;
  }
}
