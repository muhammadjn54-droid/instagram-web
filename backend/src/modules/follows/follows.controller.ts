import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FollowsService } from './follows.service.js';
import { FollowUserDto } from './dto/follow.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import {
  ApiOkWrapped,
  ApiPagedWrapped,
  ApiErrorResponses,
} from '../../common/decorators/swagger-wrapped.decorator.js';

@ApiTags('Follows')
@ApiBearerAuth('Bearer')
@ApiErrorResponses()
@Controller('users')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId/follow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Follow a user' })
  @ApiOkWrapped()
  async follow(
    @Param('userId', ParseIntPipe) followingId: number,
    @CurrentUser('id') followerId: number,
  ) {
    return this.followsService.follow(followerId, followingId);
  }

  @Delete(':userId/follow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiOkWrapped()
  async unfollow(
    @Param('userId', ParseIntPipe) followingId: number,
    @CurrentUser('id') followerId: number,
  ) {
    return this.followsService.unfollow(followerId, followingId);
  }

  @Public()
  @Get(':userId/followers')
  @ApiOperation({ summary: 'Get list of followers for a user' })
  @ApiPagedWrapped(FollowUserDto)
  async getFollowers(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: PaginationDto,
    @CurrentUser('id') currentUserId?: number,
  ) {
    return this.followsService.getFollowers(userId, query, currentUserId);
  }

  @Public()
  @Get(':userId/following')
  @ApiOperation({ summary: 'Get list of users followed by a user' })
  @ApiPagedWrapped(FollowUserDto)
  async getFollowing(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: PaginationDto,
    @CurrentUser('id') currentUserId?: number,
  ) {
    return this.followsService.getFollowing(userId, query, currentUserId);
  }
}
