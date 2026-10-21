import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service.js';
import { CreateCommentDto, CommentDto } from './dto/comment.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import {
  ApiOkWrapped,
  ApiCreatedWrapped,
  ApiPagedWrapped,
  ApiErrorResponses,
} from '../../common/decorators/swagger-wrapped.decorator.js';

@ApiTags('Comments')
@ApiBearerAuth('Bearer')
@ApiErrorResponses()
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'Get list of comments for a post' })
  @ApiPagedWrapped(CommentDto)
  async findByPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: PaginationDto,
  ) {
    return this.commentsService.findByPost(postId, query);
  }

  @Post('posts/:postId/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to a post' })
  @ApiCreatedWrapped(CommentDto)
  async create(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('id') userId: number,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, userId, dto);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete comment by ID (comment owner or post owner)' })
  @ApiOkWrapped()
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.commentsService.remove(id, userId);
  }
}
