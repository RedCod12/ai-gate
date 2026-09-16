import type { Message } from '../model/types';

export function MessageCard({ message }: { message: Message }) {
  return (
    <article className={`msg msg_${message.role}`}>
      <span className="msg__role">{message.role === 'user' ? 'запрос' : 'gate'}</span>
      <pre className="msg__body">{message.content}</pre>
    </article>
  );
}
