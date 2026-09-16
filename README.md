# Gate — анонимный AI-шлюз

Минимальный MVP: React (FSD) + NestJS + Postgres.

Анонимный пользователь открывает форму, cookie `sid` создаёт сессию, запрос уходит в любой OpenAI-совместимый гейт (или mock), ответ стримится, история пишется в БД и дублируется в `localStorage`.

## Запуск

```bash
docker compose up -d
cd backend && npm i && npx prisma migrate deploy && npm run dev
cd frontend && npm i && npm run dev
```

UI: http://127.0.0.1:5174  
API: http://127.0.0.1:3010/api

Реальный шлюз — в `backend/.env`:

```
AI_BASE_URL=https://api.groq.com/openai/v1
AI_API_KEY=...
AI_MODEL=llama-3.1-8b-instant
```

Подойдут OpenAI, Groq, OpenRouter, Ollama (`http://127.0.0.1:11434/v1`), LM Studio. Без ключа работает mock-стрим.

## Архитектура

```
браузер
  cookie sid + localStorage истории
     │  /api  (vite proxy)
     ▼
Nest
  SessionMiddleware → Chat (SSE proxy) → History
     │
     ▼
Postgres   и   OpenAI-compatible gate
```

Frontend слои FSD: `app → pages → widgets → features → entities → shared`.
Backend модули: `session`, `chat`, `history`, `prisma`.
