import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';
import { Post } from '../../entities/post.entity.js';
import { PostImage } from '../../entities/post-image.entity.js';
import { PostLike } from '../../entities/post-like.entity.js';
import { PostView } from '../../entities/post-view.entity.js';
import { Favorite } from '../../entities/favorite.entity.js';
import { Follow } from '../../entities/follow.entity.js';
import { Location } from '../../entities/location.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostImage,
      PostLike,
      PostView,
      Favorite,
      Follow,
      Location,
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
