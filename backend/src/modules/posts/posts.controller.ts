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
  UploadedFiles,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PostsService } from './posts.service.js';
import {
  CreatePostDto,
  UpdatePostDto,
  PostQueryDto,
  PostDto,
} from './dto/post.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { multerImageOptions, getFileUrl } from '../../common/utils/multer.util.js';
import {
  ApiOkWrapped,
  ApiCreatedWrapped,
  ApiPagedWrapped,
  ApiErrorResponses,
} from '../../common/decorators/swagger-wrapped.decorator.js';

@ApiTags('Posts')
@ApiBearerAuth('Bearer')
@ApiErrorResponses()
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get posts with filters (userId, title, reel) and pagination' })
  @ApiPagedWrapped(PostDto)
  async findAll(
    @Query() query: PostQueryDto,
    @CurrentUser('id') currentUserId?: number,
  ) {
    return this.postsService.findAll(query, currentUserId);
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get personalized feed from followed users' })
  @ApiPagedWrapped(PostDto)
  async getFeed(
    @CurrentUser('id') currentUserId: number,
    @Query() query: PaginationDto,
  ) {
    return this.postsService.getFeed(currentUserId, query);
  }

  @Public()
  @Get('reels')
  @ApiOperation({ summary: 'Get reels feed' })
  @ApiPagedWrapped(PostDto)
  async getReels(
    @Query() query: PaginationDto,
    @CurrentUser('id') currentUserId?: number,
  ) {
    return this.postsService.getReels(query, currentUserId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user posts' })
  @ApiPagedWrapped(PostDto)
  async getMyPosts(
    @CurrentUser('id') currentUserId: number,
    @Query() query: PaginationDto,
  ) {
    return this.postsService.getMyPosts(currentUserId, query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get post details by ID' })
  @ApiOkWrapped(PostDto)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') currentUserId?: number,
  ) {
    return this.postsService.findOne(id, currentUserId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new post with uploaded images (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Post image files (max 10, max 5MB each)',
        },
        title: { type: 'string', example: 'Mountain trip' },
        content: { type: 'string', example: 'Amazing day in Varzob!' },
        locationId: { type: 'integer', example: 1 },
        isReel: { type: 'boolean', example: false },
      },
    },
  })
  @ApiCreatedWrapped(PostDto)
  @UseInterceptors(FilesInterceptor('images', 10, multerImageOptions))
  async create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreatePostDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required for a post');
    }
    const imageUrls = files.map((f) => getFileUrl(f.filename));
    return this.postsService.create(userId, dto, imageUrls);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update post title, content, or location (owner only)' })
  @ApiOkWrapped(PostDto)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete post by ID (owner only)' })
  @ApiOkWrapped()
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.postsService.remove(id, userId);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a post' })
  @ApiOkWrapped()
  async like(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.postsService.like(id, userId);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiOkWrapped()
  async unlike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.postsService.unlike(id, userId);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a view for a post' })
  @ApiOkWrapped()
  async recordView(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.postsService.recordView(id, userId);
  }
}
