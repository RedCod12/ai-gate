export type ChatMessage = { role: 'user' | 'assistant'; content: string };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isMock() {
  const key = process.env.AI_API_KEY?.trim();
  const baseUrl = process.env.AI_BASE_URL?.trim() ?? '';
  if (key) return false;
  return !/localhost|127\.0\.0\.1/.test(baseUrl);
}

export function gateInfo() {
  const mock = isMock();
  return {
    mode: mock ? 'mock' : 'proxy',
    model: process.env.AI_MODEL?.trim() || 'gpt-4o-mini',
    baseUrl: mock ? null : process.env.AI_BASE_URL?.trim() || 'https://api.openai.com/v1',
  };
}

async function* mockStream(prompt: string): AsyncGenerator<string> {
  const text = [
    'Локальный gate, mock-режим: внешнего ключа нет, запрос не ушёл в модель.',
    '',
    `«${prompt.trim().slice(0, 400)}»`,
    '',
    'Подключите любой OpenAI-совместимый шлюз через backend/.env:',
    'AI_BASE_URL + AI_API_KEY + AI_MODEL',
    'Подойдут OpenAI, Groq, OpenRouter, Ollama, LM Studio.',
  ].join('\n');

  for (const token of text.split(/(\s+)/)) {
    await sleep(16);
    yield token;
  }
}

async function* proxyStream(messages: ChatMessage[]): AsyncGenerator<string> {
  const base = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const key = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim() || 'gpt-4o-mini';

  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!res.ok || !res.body) {
    const err = await res.text();
    throw new Error(err || `gate ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const json = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // skip malformed sse chunk
      }
    }
  }
}

export function streamCompletion(prompt: string, history: ChatMessage[]) {
  if (isMock()) return mockStream(prompt);
  return proxyStream([...history, { role: 'user', content: prompt }]);
}
