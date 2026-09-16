import { FormEvent, KeyboardEvent, useState } from 'react';

type Props = {
  disabled?: boolean;
  onSubmit: (prompt: string) => Promise<void>;
};

export function PromptForm({ disabled, onSubmit }: Props) {
  const [value, setValue] = useState('');

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    const prompt = value.trim();
    if (!prompt || disabled) return;
    setValue('');
    await onSubmit(prompt);
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  }

  return (
    <form className="prompt" onSubmit={submit}>
      <textarea
        className="prompt__input"
        rows={3}
        placeholder="Запрос в модель…"
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
      />
      <button className="prompt__btn" type="submit" disabled={disabled || !value.trim()}>
        Отправить
      </button>
    </form>
  );
}
