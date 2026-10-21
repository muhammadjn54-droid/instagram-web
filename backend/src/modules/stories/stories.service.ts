import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { Story } from '../../entities/story.entity.js';
import { StoryLike } from '../../entities/story-like.entity.js';
import { StoryView } from '../../entities/story-view.entity.js';
import { Follow } from '../../entities/follow.entity.js';
import type {
  CreateStoryDto,
  StoryDto,
  StoryViewerDto,
  UserStoriesGroupDto,
} from './dto/story.dto.js';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,
    @InjectRepository(StoryLike)
    private readonly storyLikeRepository: Repository<StoryLike>,
    @InjectRepository(StoryView)
    private readonly storyViewRepository: Repository<StoryView>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
  ) {}

  async create(
    userId: number,
    dto: CreateStoryDto,
    imageUrl: string,
  ): Promise<StoryDto> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const story = this.storyRepository.create({
      userId,
      imageUrl,
      postId: dto.postId,
      expiresAt,
    });
    const saved = await this.storyRepository.save(story);

    return this.findOne(saved.id, userId);
  }

  async getFeedStories(currentUserId: number): Promise<UserStoriesGroupDto[]> {
    const follows = await this.followRepository.find({
      where: { followerId: currentUserId },
    });
    const followingIds = follows.map((f) => f.followingId);
    const authorIds = [...new Set([...followingIds, currentUserId])];

    const now = new Date();
    const stories = await this.storyRepository.find({
      where: {
        userId: In(authorIds),
        expiresAt: MoreThan(now),
      },
      relations: {
        user: { profile: true },
        likes: true,
        views: true,
      },
      order: { createdAt: 'ASC' },
    });

    const groupsMap = new Map<number, UserStoriesGroupDto>();

    for (const story of stories) {
      const u = story.user;
      if (!u) continue;

      if (!groupsMap.has(u.id)) {
        groupsMap.set(u.id, {
          userId: u.id,
          userName: u.userName,
          userAvatar: u.profile?.avatar || '',
          stories: [],
        });
      }

      groupsMap.get(u.id)!.stories.push(this.mapToDto(story, currentUserId));
    }

    return Array.from(groupsMap.values());
  }

  async getMyStories(currentUserId: number): Promise<StoryDto[]> {
    const now = new Date();
    const stories = await this.storyRepository.find({
      where: {
        userId: currentUserId,
        expiresAt: MoreThan(now),
      },
      relations: {
        user: { profile: true },
        likes: true,
        views: true,
      },
      order: { createdAt: 'ASC' },
    });

    return stories.map((s) => this.mapToDto(s, currentUserId));
  }

  async getUserStories(
    targetUserId: number,
    currentUserId?: number,
  ): Promise<StoryDto[]> {
    const now = new Date();
    const stories = await this.storyRepository.find({
      where: {
        userId: targetUserId,
        expiresAt: MoreThan(now),
      },
      relations: {
        user: { profile: true },
        likes: true,
        views: true,
      },
      order: { createdAt: 'ASC' },
    });

    return stories.map((s) => this.mapToDto(s, currentUserId));
  }

  async findOne(id: number, currentUserId?: number): Promise<StoryDto> {
    const story = await this.storyRepository.findOne({
      where: { id },
      relations: {
        user: { profile: true },
        likes: true,
        views: true,
      },
    });

    if (!story) {
      throw new NotFoundException(`Story with ID ${id} not found`);
    }

    return this.mapToDto(story, currentUserId);
  }

  async remove(id: number, userId: number): Promise<string> {
    const story = await this.storyRepository.findOne({ where: { id } });
    if (!story) {
      throw new NotFoundException(`Story with ID ${id} not found`);
    }

    if (story.userId !== userId) {
      throw new ForbiddenException('You can only delete your own stories');
    }

    await this.storyRepository.delete(id);
    return 'Story deleted successfully';
  }

  async like(storyId: number, userId: number): Promise<string> {
    const story = await this.storyRepository.findOne({ where: { id: storyId } });
    if (!story) {
      throw new NotFoundException(`Story with ID ${storyId} not found`);
    }

    const existing = await this.storyLikeRepository.findOne({
      where: { storyId, userId },
    });
    if (existing) {
      throw new ConflictException('You have already liked this story');
    }

    const like = this.storyLikeRepository.create({ storyId, userId });
    await this.storyLikeRepository.save(like);

    return 'Story liked';
  }

  async unlike(storyId: number, userId: number): Promise<string> {
    const existing = await this.storyLikeRepository.findOne({
      where: { storyId, userId },
    });
    if (!existing) {
      throw new NotFoundException('You have not liked this story');
    }

    await this.storyLikeRepository.delete(existing.id);
    return 'Story unliked';
  }

  async recordView(storyId: number, userId: number): Promise<string> {
    const story = await this.storyRepository.findOne({ where: { id: storyId } });
    if (!story) {
      throw new NotFoundException(`Story with ID ${storyId} not found`);
    }

    const existing = await this.storyViewRepository.findOne({
      where: { storyId, userId },
    });
    if (!existing) {
      const view = this.storyViewRepository.create({ storyId, userId });
      await this.storyViewRepository.save(view);
    }

    return 'Story view recorded';
  }

  async getViewers(storyId: number, userId: number): Promise<StoryViewerDto[]> {
    const story = await this.storyRepository.findOne({ where: { id: storyId } });
    if (!story) {
      throw new NotFoundException(`Story with ID ${storyId} not found`);
    }

    if (story.userId !== userId) {
      throw new ForbiddenException('Only the story owner can view viewers');
    }

    const views = await this.storyViewRepository.find({
      where: { storyId },
      relations: { user: { profile: true } },
      order: { createdAt: 'DESC' },
    });

    return views.map((v) => ({
      userId: v.userId,
      userName: v.user?.userName || '',
      userAvatar: v.user?.profile?.avatar || '',
      viewedAt: v.createdAt,
    }));
  }

  private mapToDto(story: Story, currentUserId?: number): StoryDto {
    const isLikedByMe = currentUserId
      ? (story.likes || []).some((l) => l.userId === currentUserId)
      : false;

    return {
      id: story.id,
      userId: story.userId,
      userName: story.user?.userName || '',
      userAvatar: story.user?.profile?.avatar || '',
      imageUrl: story.imageUrl,
      postId: story.postId,
      likesCount: story.likes ? story.likes.length : 0,
      viewsCount: story.views ? story.views.length : 0,
      isLikedByMe,
      expiresAt: story.expiresAt,
      createdAt: story.createdAt,
    };
  }
}
