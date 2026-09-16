import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCard, type Message, type Session } from '@/entities/message';
import { fetchHistory, readLocalHistory, writeLocalHistory } from '@/features/history';
import { loadSession } from '@/features/session';
import { PromptForm, streamPrompt } from '@/features/send-prompt';

function localId() {
  return `tmp-${crypto.randomUUID()}`;
}

export function ChatWorkspace() {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      const s = await loadSession();
      if (!alive) return;
      setSession(s);
      setMessages(readLocalHistory(s.id));
      const remote = await fetchHistory();
      if (!alive) return;
      setMessages(remote);
      writeLocalHistory(s.id, remote);
    })().catch((e: Error) => setError(e.message));

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' });
  }, [messages, pending]);

  const titles = useMemo(
    () => messages.filter((m) => m.role === 'user').map((m) => m.content),
    [messages],
  );

  async function onSubmit(prompt: string) {
    if (!session) return;
    setError(null);
    setPending(true);

    const userMsg: Message = {
      id: localId(),
      sessionId: session.id,
      role: 'user',
      content: prompt,
      createdAt: new Date().toISOString(),
    };
    const draftId = localId();
    const draft: Message = {
      id: draftId,
      sessionId: session.id,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => {
      const next = [...prev, userMsg, draft];
      writeLocalHistory(session.id, next);
      return next;
    });

    try {
      const saved = await streamPrompt(prompt, (text) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === draftId ? { ...m, content: text } : m)),
        );
      });

      setMessages((prev) => {
        const next = prev.map((m) => (m.id === draftId ? saved : m));
        writeLocalHistory(session.id, next);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'stream error');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="shell">
      <aside className="rail">
        <p className="rail__label">сессия</p>
        <p className="rail__sid">{session?.id ?? '…'}</p>
        <p className="rail__label">локальная история</p>
        <ul className="rail__list">
          {titles.length === 0 && <li className="muted">пусто</li>}
          {titles.map((t, i) => (
            <li key={`${i}-${t.slice(0, 12)}`}>{t}</li>
          ))}
        </ul>
      </aside>

      <main className="main">
        <header className="top">
          <h1>Gate</h1>
          <p>
            анонимный вход · cookie sid ·{' '}
            {session?.gate.mode === 'proxy'
              ? `${session.gate.model}`
              : 'mock, без внешнего API'}
          </p>
        </header>

        <section className="feed">
          {messages.length === 0 && (
            <p className="muted">Введите запрос. Ответ стримится, история пишется в Postgres и localStorage.</p>
          )}
          {messages.map((m) => (
            <MessageCard key={m.id} message={m} />
          ))}
          {error && <p className="err">{error}</p>}
          <div ref={bottom} />
        </section>

        <PromptForm disabled={pending || !session} onSubmit={onSubmit} />
      </main>
    </div>
  );
}
