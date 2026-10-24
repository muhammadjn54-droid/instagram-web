import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity.js';
import { Profile } from '../../entities/profile.entity.js';
import { Follow } from '../../entities/follow.entity.js';
import { Post } from '../../entities/post.entity.js';
import { Favorite } from '../../entities/favorite.entity.js';
import type { UpdateProfileDto, ProfileDetailDto } from './dto/profile.dto.js';
import { PagedResult } from '../../common/responses/api-response.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { PostsService } from '../posts/posts.service.js';
import type { PostDto } from '../posts/dto/post.dto.js';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    private readonly postsService: PostsService,
  ) {}

  async getProfile(userId: number, currentUserId?: number): Promise<ProfileDetailDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { profile: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let profile = user.profile;
    if (!profile) {
      profile = this.profileRepository.create({ userId: user.id });
      await this.profileRepository.save(profile);
    }

    const followersCount = await this.followRepository.count({
      where: { followingId: user.id },
    });

    const followingCount = await this.followRepository.count({
      where: { followerId: user.id },
    });

    const postsCount = await this.postRepository.count({
      where: { userId: user.id },
    });

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const follow = await this.followRepository.findOne({
        where: { followerId: currentUserId, followingId: user.id },
      });
      isFollowing = !!follow;
    }

    return {
      userId: user.id,
      userName: user.userName,
      fullName: user.fullName,
      bio: profile.bio || '',
      avatar: profile.avatar || '',
      website: profile.website || '',
      gender: profile.gender,
      isPrivate: profile.isPrivate,
      followersCount,
      followingCount,
      postsCount,
      isFollowing,
    };
  }

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<ProfileDetailDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.userName && dto.userName !== user.userName) {
      const existing = await this.userRepository.findOne({
        where: { userName: dto.userName },
      });
      if (existing) {
        throw new ConflictException('Username already taken');
      }
      user.userName = dto.userName;
    }

    if (dto.fullName) {
      user.fullName = dto.fullName;
    }
    await this.userRepository.save(user);

    let profile = user.profile;
    if (!profile) {
      profile = this.profileRepository.create({ userId });
    }

    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.website !== undefined) profile.website = dto.website;
    if (dto.gender !== undefined) profile.gender = dto.gender;
    if (dto.isPrivate !== undefined) profile.isPrivate = dto.isPrivate;

    await this.profileRepository.save(profile);

    return this.getProfile(userId, userId);
  }

  async updateAvatar(userId: number, avatarUrl: string): Promise<string> {
    let profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepository.create({ userId, avatar: avatarUrl });
    } else {
      profile.avatar = avatarUrl;
    }
    await this.profileRepository.save(profile);
    return avatarUrl;
  }

  async deleteAvatar(userId: number): Promise<string> {
    await this.profileRepository.update({ userId }, { avatar: '' });
    return 'Avatar removed';
  }

  async getFavorites(
    userId: number,
    query: PaginationDto,
  ): Promise<PagedResult<PostDto>> {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 10, 100);
    const skip = (pageNumber - 1) * pageSize;

    const [favorites, totalCount] = await this.favoriteRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    const posts = await this.postsService.findByIds(
      favorites.map((f) => f.postId),
      userId,
    );
    return new PagedResult(posts, totalCount, pageNumber, pageSize);
  }
}
