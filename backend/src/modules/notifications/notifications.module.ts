import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { Follow } from '../../entities/follow.entity.js';
import { PostLike } from '../../entities/post-like.entity.js';
import { Comment } from '../../entities/comment.entity.js';
import { StoryLike } from '../../entities/story-like.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, PostLike, Comment, StoryLike])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
