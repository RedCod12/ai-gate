import { Module } from '@nestjs/common';
import { HistoryModule } from '../history/history.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [HistoryModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
