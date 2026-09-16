import type { Message } from '@/entities/message';

type StreamEvent =
  | { delta: string; done?: undefined; error?: undefined; message?: undefined }
  | { done: true; message: Message; delta?: undefined; error?: undefined }
  | { error: string; delta?: undefined; done?: undefined; message?: undefined };

export async function streamPrompt(
  prompt: string,
  onDelta: (text: string) => void,
): Promise<Message> {
  const res = await fetch('/api/chat/stream', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.body) throw new Error('no stream');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let acc = '';
  let saved: Message | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const chunks = buf.split('\n\n');
    buf = chunks.pop() ?? '';

    for (const chunk of chunks) {
      const line = chunk.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      const ev = JSON.parse(line.slice(6)) as StreamEvent;
      if (ev.error) throw new Error(ev.error);
      if (ev.delta) {
        acc += ev.delta;
        onDelta(acc);
      }
      if (ev.done) saved = ev.message;
    }
  }

  if (!saved) {
    saved = {
      id: `local-${Date.now()}`,
      sessionId: '',
      role: 'assistant',
      content: acc,
      createdAt: new Date().toISOString(),
    };
  }

  return saved;
}
