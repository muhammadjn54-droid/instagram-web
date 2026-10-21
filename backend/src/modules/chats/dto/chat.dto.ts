import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({ example: 2, description: 'User ID of recipient to start chat with' })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  receiverUserId!: number;
}

export class SendMessageDto {
  @ApiPropertyOptional({ example: 'Hello! How are you doing today?' })
  @IsString()
  @IsOptional()
  text?: string;
}

export class MessageDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  chatId!: number;

  @ApiProperty({ example: 1 })
  senderId!: number;

  @ApiProperty({ example: 'muhammad_2026' })
  senderName!: string;

  @ApiProperty({ example: '/uploads/avatar.jpg' })
  senderAvatar!: string;

  @ApiPropertyOptional({ example: 'Hello! How are you doing today?' })
  text?: string;

  @ApiPropertyOptional({ example: '/uploads/file.jpg' })
  fileUrl?: string;

  @ApiProperty({ example: false })
  isRead!: boolean;

  @ApiProperty({ example: '2026-10-21T12:00:00.000Z' })
  createdAt!: Date;
}

export class ChatUserDto {
  @ApiProperty({ example: 2 })
  id!: number;

  @ApiProperty({ example: 'maria_art' })
  userName!: string;

  @ApiProperty({ example: 'Maria Ivanova' })
  fullName!: string;

  @ApiProperty({ example: '/uploads/maria.jpg' })
  avatar!: string;
}

export class ChatListItemDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ type: ChatUserDto })
  otherUser!: ChatUserDto;

  @ApiPropertyOptional({ type: MessageDto })
  lastMessage?: MessageDto;

  @ApiProperty({ example: '2026-10-21T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-21T12:00:00.000Z' })
  updatedAt!: Date;
}
