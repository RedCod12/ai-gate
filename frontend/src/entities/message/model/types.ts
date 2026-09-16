export type Role = 'user' | 'assistant';

export type Message = {
  id: string;
  sessionId: string;
  role: Role;
  content: string;
  createdAt: string;
};

export type Session = {
  id: string;
  gate: {
    mode: 'mock' | 'proxy';
    model: string;
    baseUrl: string | null;
  };
};
