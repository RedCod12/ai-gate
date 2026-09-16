import { api } from '@/shared/api/http';
import type { Session } from '@/entities/message';

export function loadSession() {
  return api<Session>('/api/session/me');
}
