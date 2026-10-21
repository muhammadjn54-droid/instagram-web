import {
  Controller,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import {
  ApiOkWrapped,
  ApiErrorResponses,
} from '../../common/decorators/swagger-wrapped.decorator.js';

@ApiTags('Favorites')
@ApiBearerAuth('Bearer')
@ApiErrorResponses()
@Controller('posts')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':postId/favorite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save a post to favorites' })
  @ApiOkWrapped()
  async addFavorite(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.favoritesService.addFavorite(postId, userId);
  }

  @Delete(':postId/favorite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a post from favorites' })
  @ApiOkWrapped()
  async removeFavorite(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.favoritesService.removeFavorite(postId, userId);
  }
}
