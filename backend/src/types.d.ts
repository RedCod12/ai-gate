export {};

declare global {
  namespace Express {
    interface Request {
      sessionId: string;
    }
  }
}
