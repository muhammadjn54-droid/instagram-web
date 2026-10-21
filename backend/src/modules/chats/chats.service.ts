import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../../entities/chat.entity.js';
import { Message } from '../../entities/message.entity.js';
import { User } from '../../entities/user.entity.js';
import type {
  CreateChatDto,
  SendMessageDto,
  MessageDto,
  ChatListItemDto,
} from './dto/chat.dto.js';
import { PagedResult } from '../../common/responses/api-response.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getOrCreateChat(
    userId: number,
    dto: CreateChatDto,
  ): Promise<ChatListItemDto> {
    if (userId === dto.receiverUserId) {
      throw new BadRequestException('You cannot create a chat with yourself');
    }

    const receiver = await this.userRepository.findOne({
      where: { id: dto.receiverUserId },
      relations: { profile: true },
    });
    if (!receiver) {
      throw new NotFoundException(`User with ID ${dto.receiverUserId} not found`);
    }

    let chat = await this.chatRepository.findOne({
      where: [
        { user1Id: userId, user2Id: dto.receiverUserId },
        { user1Id: dto.receiverUserId, user2Id: userId },
      ],
      relations: {
        user1: { profile: true },
        user2: { profile: true },
        messages: true,
      },
    });

    if (!chat) {
      chat = this.chatRepository.create({
        user1Id: userId,
        user2Id: dto.receiverUserId,
      });
      chat = await this.chatRepository.save(chat);
      chat.user1 = (await this.userRepository.findOne({
        where: { id: userId },
        relations: { profile: true },
      })) as User;
      chat.user2 = receiver;
      chat.messages = [];
    }

    return this.mapToChatListItem(chat, userId);
  }

  async getMyChats(userId: number): Promise<ChatListItemDto[]> {
    const chats = await this.chatRepository.find({
      where: [{ user1Id: userId }, { user2Id: userId }],
      relations: {
        user1: { profile: true },
        user2: { profile: true },
        messages: {
          sender: { profile: true },
        },
      },
      order: { updatedAt: 'DESC' },
    });

    return chats.map((c) => this.mapToChatListItem(c, userId));
  }

  async getChatById(chatId: number, userId: number): Promise<ChatListItemDto> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: {
        user1: { profile: true },
        user2: { profile: true },
        messages: {
          sender: { profile: true },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    return this.mapToChatListItem(chat, userId);
  }

  async getMessages(
    chatId: number,
    userId: number,
    query: PaginationDto,
  ): Promise<PagedResult<MessageDto>> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (pageNumber - 1) * pageSize;

    const [messages, totalCount] = await this.messageRepository.findAndCount({
      where: { chatId },
      relations: { sender: { profile: true } },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    const items: MessageDto[] = messages.map((m) => ({
      id: m.id,
      chatId: m.chatId,
      senderId: m.senderId,
      senderName: m.sender?.userName || '',
      senderAvatar: m.sender?.profile?.avatar || '',
      text: m.text,
      fileUrl: m.fileUrl,
      isRead: m.isRead,
      createdAt: m.createdAt,
    }));

    return new PagedResult(items, totalCount, pageNumber, pageSize);
  }

  async sendMessage(
    chatId: number,
    userId: number,
    dto: SendMessageDto,
    fileUrl?: string,
  ): Promise<MessageDto> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    if (!dto.text && !fileUrl) {
      throw new BadRequestException('At least text or file is required');
    }

    const message = this.messageRepository.create({
      chatId,
      senderId: userId,
      text: dto.text,
      fileUrl,
      isRead: false,
    });
    const saved = await this.messageRepository.save(message);

    // Update chat updatedAt
    await this.chatRepository.update(chatId, { updatedAt: new Date() });

    const full = await this.messageRepository.findOne({
      where: { id: saved.id },
      relations: { sender: { profile: true } },
    });

    return {
      id: full!.id,
      chatId: full!.chatId,
      senderId: full!.senderId,
      senderName: full!.sender?.userName || '',
      senderAvatar: full!.sender?.profile?.avatar || '',
      text: full!.text,
      fileUrl: full!.fileUrl,
      isRead: full!.isRead,
      createdAt: full!.createdAt,
    };
  }

  async deleteMessage(
    chatId: number,
    messageId: number,
    userId: number,
  ): Promise<string> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, chatId },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.messageRepository.delete(messageId);
    return 'Message deleted';
  }

  async deleteChat(chatId: number, userId: number): Promise<string> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    await this.chatRepository.delete(chatId);
    return 'Chat deleted';
  }

  async markAsRead(chatId: number, userId: number): Promise<string> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new ForbiddenException('You are not a member of this chat');
    }

    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('chatId = :chatId AND senderId != :userId', { chatId, userId })
      .execute();

    return 'Messages marked as read';
  }

  private mapToChatListItem(chat: Chat, currentUserId: number): ChatListItemDto {
    const other = chat.user1Id === currentUserId ? chat.user2 : chat.user1;
    const sortedMessages = (chat.messages || []).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const last = sortedMessages[0];

    return {
      id: chat.id,
      otherUser: {
        id: other?.id || 0,
        userName: other?.userName || '',
        fullName: other?.fullName || '',
        avatar: other?.profile?.avatar || '',
      },
      lastMessage: last
        ? {
            id: last.id,
            chatId: last.chatId,
            senderId: last.senderId,
            senderName: last.sender?.userName || '',
            senderAvatar: last.sender?.profile?.avatar || '',
            text: last.text,
            fileUrl: last.fileUrl,
            isRead: last.isRead,
            createdAt: last.createdAt,
          }
        : undefined,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }
}
