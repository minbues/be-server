import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from '../../entities/message.entity';
import { ConversationEntity } from '../../entities/conversations.entity';
import { ChatController } from './chat.controller';
import { WssModule } from '../wss/wss.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity, ConversationEntity]),
    UsersModule,
    forwardRef(() => WssModule),
  ],
  exports: [ChatService],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
