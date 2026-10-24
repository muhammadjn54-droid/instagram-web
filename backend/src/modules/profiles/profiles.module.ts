import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller.js';
import { ProfilesService } from './profiles.service.js';
import { Profile } from '../../entities/profile.entity.js';
import { User } from '../../entities/user.entity.js';
import { Follow } from '../../entities/follow.entity.js';
import { Post } from '../../entities/post.entity.js';
import { Favorite } from '../../entities/favorite.entity.js';
import { PostsModule } from '../posts/posts.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, User, Follow, Post, Favorite]),
    PostsModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
