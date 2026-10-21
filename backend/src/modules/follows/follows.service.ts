import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../../entities/follow.entity.js';
import { User } from '../../entities/user.entity.js';
import type { FollowUserDto } from './dto/follow.dto.js';
import { PagedResult } from '../../common/responses/api-response.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async follow(followerId: number, followingId: number): Promise<string> {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const targetUser = await this.userRepository.findOne({
      where: { id: followingId },
    });
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${followingId} not found`);
    }

    const existing = await this.followRepository.findOne({
      where: { followerId, followingId },
    });
    if (existing) {
      throw new ConflictException('You are already following this user');
    }

    const follow = this.followRepository.create({ followerId, followingId });
    await this.followRepository.save(follow);

    return `Now following ${targetUser.userName}`;
  }

  async unfollow(followerId: number, followingId: number): Promise<string> {
    const existing = await this.followRepository.findOne({
      where: { followerId, followingId },
    });
    if (!existing) {
      throw new NotFoundException('You are not following this user');
    }

    await this.followRepository.delete(existing.id);
    return 'Unfollowed successfully';
  }

  async getFollowers(
    userId: number,
    query: PaginationDto,
    currentUserId?: number,
  ): Promise<PagedResult<FollowUserDto>> {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 10, 100);
    const skip = (pageNumber - 1) * pageSize;

    const [follows, totalCount] = await this.followRepository.findAndCount({
      where: { followingId: userId },
      relations: { follower: { profile: true } },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    const items: FollowUserDto[] = await Promise.all(
      follows.map(async (f) => {
        const u = f.follower!;
        let isFollowing = false;
        if (currentUserId && currentUserId !== u.id) {
          const check = await this.followRepository.findOne({
            where: { followerId: currentUserId, followingId: u.id },
          });
          isFollowing = !!check;
        }

        return {
          userId: u.id,
          userName: u.userName,
          fullName: u.fullName,
          avatar: u.profile?.avatar || '',
          isFollowing,
        };
      }),
    );

    return new PagedResult(items, totalCount, pageNumber, pageSize);
  }

  async getFollowing(
    userId: number,
    query: PaginationDto,
    currentUserId?: number,
  ): Promise<PagedResult<FollowUserDto>> {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 10, 100);
    const skip = (pageNumber - 1) * pageSize;

    const [follows, totalCount] = await this.followRepository.findAndCount({
      where: { followerId: userId },
      relations: { following: { profile: true } },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    const items: FollowUserDto[] = await Promise.all(
      follows.map(async (f) => {
        const u = f.following!;
        let isFollowing = false;
        if (currentUserId && currentUserId !== u.id) {
          const check = await this.followRepository.findOne({
            where: { followerId: currentUserId, followingId: u.id },
          });
          isFollowing = !!check;
        }

        return {
          userId: u.id,
          userName: u.userName,
          fullName: u.fullName,
          avatar: u.profile?.avatar || '',
          isFollowing,
        };
      }),
    );

    return new PagedResult(items, totalCount, pageNumber, pageSize);
  }
}
