import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { HealthController } from './health.controller';
import { HistoryModule } from './history/history.module';
import { PrismaModule } from './prisma/prisma.module';
import { SessionMiddleware } from './session/session.middleware';
import { SessionModule } from './session/session.module';

@Module({
  imports: [PrismaModule, SessionModule, HistoryModule, ChatModule],
  controllers: [HealthController],
  providers: [SessionMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
