import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  list(sessionId: string) {
    return this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  add(sessionId: string, role: Role, content: string) {
    return this.prisma.message.create({
      data: { sessionId, role, content },
    });
  }

  context(sessionId: string, take = 20) {
    return this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }
}
