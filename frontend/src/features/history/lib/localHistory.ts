import { LS_HISTORY } from '@/shared/config';
import type { Message } from '@/entities/message';

export function readLocalHistory(sessionId: string): Message[] {
  try {
    return JSON.parse(localStorage.getItem(LS_HISTORY(sessionId)) || '[]') as Message[];
  } catch {
    return [];
  }
}

export function writeLocalHistory(sessionId: string, messages: Message[]) {
  localStorage.setItem(LS_HISTORY(sessionId), JSON.stringify(messages));
}
