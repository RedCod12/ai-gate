import { api } from '@/shared/api/http';
import type { Message } from '@/entities/message';

export function fetchHistory() {
  return api<Message[]>('/api/history');
}
