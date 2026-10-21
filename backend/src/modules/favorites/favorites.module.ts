import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesController } from './favorites.controller.js';
import { FavoritesService } from './favorites.service.js';
import { Favorite } from '../../entities/favorite.entity.js';
import { Post } from '../../entities/post.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Post])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
