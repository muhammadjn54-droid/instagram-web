import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsController } from './chats.controller.js';
import { ChatsService } from './chats.service.js';
import { Chat } from '../../entities/chat.entity.js';
import { Message } from '../../entities/message.entity.js';
import { User } from '../../entities/user.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message, User])],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
