import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

const COOKIE = 'sid';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let id = req.cookies?.[COOKIE] as string | undefined;

    if (id) {
      const found = await this.prisma.session.findUnique({ where: { id } });
      if (!found) id = undefined;
    }

    if (!id) {
      const session = await this.prisma.session.create({ data: {} });
      id = session.id;
      res.cookie(COOKIE, id, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
    }

    req.sessionId = id;
    next();
  }
}
