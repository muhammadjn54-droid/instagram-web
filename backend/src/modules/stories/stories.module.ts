import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoriesController } from './stories.controller.js';
import { StoriesService } from './stories.service.js';
import { Story } from '../../entities/story.entity.js';
import { StoryLike } from '../../entities/story-like.entity.js';
import { StoryView } from '../../entities/story-view.entity.js';
import { Follow } from '../../entities/follow.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Story, StoryLike, StoryView, Follow])],
  controllers: [StoriesController],
  providers: [StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}
