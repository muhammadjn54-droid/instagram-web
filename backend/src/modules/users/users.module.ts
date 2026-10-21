import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { User } from '../../entities/user.entity.js';
import { Profile } from '../../entities/profile.entity.js';
import { Follow } from '../../entities/follow.entity.js';
import { Post } from '../../entities/post.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Follow, Post])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
