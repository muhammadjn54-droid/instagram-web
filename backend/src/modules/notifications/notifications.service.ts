import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Follow } from '../../entities/follow.entity.js';
import { PostLike } from '../../entities/post-like.entity.js';
import { Comment } from '../../entities/comment.entity.js';
import { StoryLike } from '../../entities/story-like.entity.js';
import type { User } from '../../entities/user.entity.js';
import type { Post } from '../../entities/post.entity.js';
import type {
  NotificationActorDto,
  NotificationDto,
  NotificationTargetDto,
} from './dto/notification.dto.js';

/** How many events of every kind are read before they are merged and cut. */
const PER_SOURCE_LIMIT = 100;

/**
 * Notifications are not stored: they are derived from what already exists —
 * new followers, likes and comments on the user's posts, likes on the user's
 * stories. Nothing can get out of sync with the real data, and a deleted like
 * or comment simply disappears from the list.
 */
@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(StoryLike)
    private readonly storyLikeRepository: Repository<StoryLike>,
  ) {}

  async findAll(userId: number): Promise<NotificationDto[]> {
    const [followers, postLikes, comments, storyLikes, following] = await Promise.all([
      this.followRepository.find({
        where: { followingId: userId },
        relations: { follower: { profile: true } },
        order: { createdAt: 'DESC' },
        take: PER_SOURCE_LIMIT,
      }),
      this.postLikeRepository.find({
        where: { post: { userId }, userId: Not(userId) },
        relations: { user: { profile: true }, post: { images: true } },
        order: { createdAt: 'DESC' },
        take: PER_SOURCE_LIMIT,
      }),
      this.commentRepository.find({
        where: { post: { userId }, userId: Not(userId) },
        relations: { user: { profile: true }, post: { images: true } },
        order: { createdAt: 'DESC' },
        take: PER_SOURCE_LIMIT,
      }),
      this.storyLikeRepository.find({
        where: { story: { userId }, userId: Not(userId) },
        relations: { user: { profile: true }, story: true },
        order: { createdAt: 'DESC' },
        take: PER_SOURCE_LIMIT,
      }),
      this.followRepository.find({ where: { followerId: userId } }),
    ]);

    const followedIds = new Set(following.map((follow) => follow.followingId));

    const actorOf = (user?: User): NotificationActorDto => ({
      id: user?.id ?? 0,
      userName: user?.userName ?? '',
      fullName: user?.fullName ?? '',
      avatar: user?.profile?.avatar ?? '',
      isFollowing: user ? followedIds.has(user.id) : false,
    });

    const postTarget = (post?: Post): NotificationTargetDto | undefined =>
      post
        ? {
            postId: post.id,
            image: [...(post.images ?? [])].sort((a, b) => a.order - b.order)[0]?.url,
          }
        : undefined;

    const items: NotificationDto[] = [
      ...followers.map(
        (follow): NotificationDto => ({
          id: `follow-${follow.id}`,
          type: 'follow',
          actor: actorOf(follow.follower),
          createdAt: follow.createdAt,
        }),
      ),
      ...postLikes.map(
        (like): NotificationDto => ({
          id: `like-${like.id}`,
          type: 'like',
          actor: actorOf(like.user),
          target: postTarget(like.post),
          createdAt: like.createdAt,
        }),
      ),
      ...comments.map(
        (comment): NotificationDto => ({
          id: `comment-${comment.id}`,
          type: 'comment',
          actor: actorOf(comment.user),
          text: comment.content,
          target: postTarget(comment.post),
          createdAt: comment.createdAt,
        }),
      ),
      ...storyLikes.map(
        (like): NotificationDto => ({
          id: `story_like-${like.id}`,
          type: 'story_like',
          actor: actorOf(like.user),
          target: like.story ? { image: like.story.imageUrl } : undefined,
          createdAt: like.createdAt,
        }),
      ),
    ];

    return items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, PER_SOURCE_LIMIT);
  }
}
