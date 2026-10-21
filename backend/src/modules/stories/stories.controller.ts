import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StoriesService } from './stories.service.js';
import {
  CreateStoryDto,
  StoryDto,
  StoryViewerDto,
  UserStoriesGroupDto,
} from './dto/story.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { multerImageOptions, getFileUrl } from '../../common/utils/multer.util.js';
import {
  ApiOkWrapped,
  ApiCreatedWrapped,
  ApiErrorResponses,
} from '../../common/decorators/swagger-wrapped.decorator.js';

@ApiTags('Stories')
@ApiBearerAuth('Bearer')
@ApiErrorResponses()
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get active stories feed from followed users (last 24 hours)' })
  @ApiOkWrapped(UserStoriesGroupDto)
  async getFeedStories(@CurrentUser('id') currentUserId: number) {
    return this.storiesService.getFeedStories(currentUserId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user active stories' })
  @ApiOkWrapped(StoryDto)
  async getMyStories(@CurrentUser('id') currentUserId: number) {
    return this.storiesService.getMyStories(currentUserId);
  }

  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get active stories for a specific user ID' })
  @ApiOkWrapped(StoryDto)
  async getUserStories(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser('id') currentUserId?: number,
  ) {
    return this.storiesService.getUserStories(userId, currentUserId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get single story by ID' })
  @ApiOkWrapped(StoryDto)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') currentUserId?: number,
  ) {
    return this.storiesService.findOne(id, currentUserId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publish a new story (expires in 24 hours)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary', description: 'Story image file' },
        postId: { type: 'integer', description: 'Optional linked post ID' },
      },
    },
  })
  @ApiCreatedWrapped(StoryDto)
  @UseInterceptors(FileInterceptor('image', multerImageOptions))
  async create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateStoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Story image file is required');
    }
    const imageUrl = getFileUrl(file.filename);
    return this.storiesService.create(userId, dto, imageUrl);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete story by ID (owner only)' })
  @ApiOkWrapped()
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.storiesService.remove(id, userId);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a story' })
  @ApiOkWrapped()
  async like(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.storiesService.like(id, userId);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike a story' })
  @ApiOkWrapped()
  async unlike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.storiesService.unlike(id, userId);
  }

  @Post(':id/views')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a view on a story' })
  @ApiOkWrapped()
  async recordView(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.storiesService.recordView(id, userId);
  }

  @Get(':id/viewers')
  @ApiOperation({ summary: 'Get list of viewers for a story (story owner only)' })
  @ApiOkWrapped(StoryViewerDto)
  async getViewers(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.storiesService.getViewers(id, userId);
  }
}
