import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Post } from '../../entities/post.entity.js';
import { PostImage } from '../../entities/post-image.entity.js';
import { PostLike } from '../../entities/post-like.entity.js';
import { PostView } from '../../entities/post-view.entity.js';
import { Favorite } from '../../entities/favorite.entity.js';
import { Follow } from '../../entities/follow.entity.js';
import type {
  CreatePostDto,
  UpdatePostDto,
  PostQueryDto,
  PostDto,
} from './dto/post.dto.js';
import { PagedResult } from '../../common/responses/api-response.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostImage)
    private readonly postImageRepository: Repository<PostImage>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(PostView)
    private readonly postViewRepository: Repository<PostView>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
  ) {}

  async create(
    userId: number,
    dto: CreatePostDto,
    imageUrls: string[],
  ): Promise<PostDto> {
    if (!imageUrls || imageUrls.length === 0) {
      throw new BadRequestException('At least one image is required for a post');
    }

    const post = this.postRepository.create({
      userId,
      title: dto.title,
      content: dto.content || '',
      locationId: dto.locationId,
      isReel: !!dto.isReel,
    });
    const savedPost = await this.postRepository.save(post);

    const postImages = imageUrls.map((url, index) =>
      this.postImageRepository.create({
        postId: savedPost.id,
        url,
        order: index,
      }),
    );
    await this.postImageRepository.save(postImages);

    return this.findOne(savedPost.id, userId);
  }

  async findAll(
    query: PostQueryDto,
    currentUserId?: number,
  ): Promise<PagedResult<PostDto>> {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 10, 100);
    const skip = (pageNumber - 1) * pageSize;

    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('post.location', 'location')
      .leftJoinAndSelect('post.images', 'images')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('post.views', 'views')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.favorites', 'favorites');

    if (query.userId) {
      qb.andWhere('post.userId = :userId', { userId: query.userId });
    }
    if (query.title) {
      qb.andWhere('post.title LIKE :title', { title: `%${query.title}%` });
    }
    if (query.isReel !== undefined) {
      qb.andWhere('post.isReel = :isReel', { isReel: query.isReel });
    }

    qb.orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize);

    const [posts, totalCount] = await qb.getManyAndCount();
    const items = posts.map((p) => this.mapToDto(p, currentUserId));

    return new PagedResult(items, totalCount, pageNumber, pageSize);
  }

  async getFeed(
    currentUserId: number,
    query: PaginationDto,
  ): Promise<PagedResult<PostDto>> {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 10, 100);
    const skip = (pageNumber - 1) * pageSize;

    const follows = await this.followRepository.find({
      where: { followerId: currentUserId },
    });
    const followingIds = follows.map((f) => f.followingId);

    // Include own posts + following
    const authorIds = [...new Set([...followingIds, currentUserId])];

    const [posts, totalCount] = await this.postRepository.findAndCount({
      where: { userId: In(authorIds) },
      relations: {
        user: { profile: true },
        location: true,
        images: true,
        likes: true,
        views: true,
        comments: true,
        favorites: true,
      },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    const items = posts.map((p) => this.mapToDto(p, currentUserId));
    return new PagedResult(items, totalCount, pageNumber, pageSize);
  }

  async getReels(
    query: PaginationDto,
    currentUserId?: number,
  ): Promise<PagedResult<PostDto>> {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 10, 100);
    const skip = (pageNumber - 1) * pageSize;

    const [posts, totalCount] = await this.postRepository.findAndCount({
      where: { isReel: true },
      relations: {
        user: { profile: true },
        location: true,
        images: true,
        likes: true,
        views: true,
        comments: true,
        favorites: true,
      },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    const items = posts.map((p) => this.mapToDto(p, currentUserId));
    return new PagedResult(items, totalCount, pageNumber, pageSize);
  }

  async getMyPosts(
    currentUserId: number,
    query: PaginationDto,
  ): Promise<PagedResult<PostDto>> {
    return this.findAll({ ...query, userId: currentUserId }, currentUserId);
  }

  async findOne(id: number, currentUserId?: number): Promise<PostDto> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: {
        user: { profile: true },
        location: true,
        images: true,
        likes: true,
        views: true,
        comments: true,
        favorites: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return this.mapToDto(post, currentUserId);
  }

  async update(
    id: number,
    userId: number,
    dto: UpdatePostDto,
  ): Promise<PostDto> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    if (dto.title !== undefined) post.title = dto.title;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.locationId !== undefined) post.locationId = dto.locationId;

    await this.postRepository.save(post);
    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number): Promise<string> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.delete(id);
    return 'Post deleted successfully';
  }

  async like(postId: number, userId: number): Promise<string> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const existing = await this.postLikeRepository.findOne({
      where: { postId, userId },
    });
    if (existing) {
      throw new ConflictException('You have already liked this post');
    }

    const like = this.postLikeRepository.create({ postId, userId });
    await this.postLikeRepository.save(like);

    return 'Post liked';
  }

  async unlike(postId: number, userId: number): Promise<string> {
    const existing = await this.postLikeRepository.findOne({
      where: { postId, userId },
    });
    if (!existing) {
      throw new NotFoundException('You have not liked this post');
    }

    await this.postLikeRepository.delete(existing.id);
    return 'Post unliked';
  }

  async recordView(postId: number, userId: number): Promise<string> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const existing = await this.postViewRepository.findOne({
      where: { postId, userId },
    });
    if (!existing) {
      const view = this.postViewRepository.create({ postId, userId });
      await this.postViewRepository.save(view);
    }

    return 'View recorded';
  }

  private mapToDto(post: Post, currentUserId?: number): PostDto {
    const images = (post.images || [])
      .sort((a, b) => a.order - b.order)
      .map((img) => img.url);

    const isLikedByMe = currentUserId
      ? (post.likes || []).some((l) => l.userId === currentUserId)
      : false;

    const isFavoriteByMe = currentUserId
      ? (post.favorites || []).some((f) => f.userId === currentUserId)
      : false;

    return {
      id: post.id,
      userId: post.userId,
      userName: post.user?.userName || '',
      userAvatar: post.user?.profile?.avatar || '',
      title: post.title,
      content: post.content,
      images,
      location: post.location
        ? {
            id: post.location.id,
            name: post.location.name,
            city: post.location.city,
            country: post.location.country,
          }
        : undefined,
      likesCount: post.likes ? post.likes.length : 0,
      commentsCount: post.comments ? post.comments.length : 0,
      viewsCount: post.views ? post.views.length : 0,
      isLikedByMe,
      isFavoriteByMe,
      isReel: post.isReel,
      createdAt: post.createdAt,
    };
  }
}
