import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ChatsService } from './chats.service.js';
import {
  CreateChatDto,
  SendMessageDto,
  MessageDto,
  ChatListItemDto,
} from './dto/chat.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { multerImageOptions, getFileUrl } from '../../common/utils/multer.util.js';
import {
  ApiOkWrapped,
  ApiCreatedWrapped,
  ApiPagedWrapped,
  ApiErrorResponses,
} from '../../common/decorators/swagger-wrapped.decorator.js';

@ApiTags('Chats')
@ApiBearerAuth('Bearer')
@ApiErrorResponses()
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all chats for current user' })
  @ApiOkWrapped(ChatListItemDto)
  async getMyChats(@CurrentUser('id') userId: number) {
    return this.chatsService.getMyChats(userId);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create or get existing chat with a user' })
  @ApiOkWrapped(ChatListItemDto)
  async getOrCreateChat(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateChatDto,
  ) {
    return this.chatsService.getOrCreateChat(userId, dto);
  }

  @Get(':chatId')
  @ApiOperation({ summary: 'Get chat details by ID' })
  @ApiOkWrapped(ChatListItemDto)
  async getChatById(
    @Param('chatId', ParseIntPipe) chatId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.chatsService.getChatById(chatId, userId);
  }

  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Get paginated messages of a chat' })
  @ApiPagedWrapped(MessageDto)
  async getMessages(
    @Param('chatId', ParseIntPipe) chatId: number,
    @CurrentUser('id') userId: number,
    @Query() query: PaginationDto,
  ) {
    return this.chatsService.getMessages(chatId, userId, query);
  }

  @Post(':chatId/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message (plain text or with image file)' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'Hey there!' },
        file: { type: 'string', format: 'binary', description: 'Optional image file' },
      },
    },
  })
  @ApiCreatedWrapped(MessageDto)
  @UseInterceptors(FileInterceptor('file', multerImageOptions))
  async sendMessage(
    @Param('chatId', ParseIntPipe) chatId: number,
    @CurrentUser('id') userId: number,
    @Body() dto: SendMessageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const fileUrl = file ? getFileUrl(file.filename) : undefined;
    return this.chatsService.sendMessage(chatId, userId, dto, fileUrl);
  }

  @Patch(':chatId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark messages in chat as read' })
  @ApiOkWrapped()
  async markAsRead(
    @Param('chatId', ParseIntPipe) chatId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.chatsService.markAsRead(chatId, userId);
  }

  @Delete(':chatId/messages/:messageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete message (sender only)' })
  @ApiOkWrapped()
  async deleteMessage(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.chatsService.deleteMessage(chatId, messageId, userId);
  }

  @Delete(':chatId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete entire chat' })
  @ApiOkWrapped()
  async deleteChat(
    @Param('chatId', ParseIntPipe) chatId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.chatsService.deleteChat(chatId, userId);
  }
}
