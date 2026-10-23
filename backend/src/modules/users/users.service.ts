import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../../entities/user.entity.js';
import { Follow } from '../../entities/follow.entity.js';
import { Post } from '../../entities/post.entity.js';
import type { UserQueryDto, UserListItemDto, UserDetailDto } from './dto/user.dto.js';
import { PagedResult } from '../../common/responses/api-response.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(
    query: UserQueryDto,
    currentUserId?: number,
  ): Promise<PagedResult<UserListItemDto>> {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 10, 100);
    const skip = (pageNumber - 1) * pageSize;

    const where = query.search
      ? [
          { userName: Like(`%${query.search}%`) },
          { fullName: Like(`%${query.search}%`) },
          { email: Like(`%${query.search}%`) },
        ]
      : {};

    const [users, totalCount] = await this.userRepository.findAndCount({
      where,
      relations: { profile: true },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    const items: UserListItemDto[] = await Promise.all(
      users.map(async (u) => {
        const followersCount = await this.followRepository.count({
          where: { followingId: u.id },
        });

        let isFollowing = false;
        if (currentUserId) {
          const follow = await this.followRepository.findOne({
            where: { followerId: currentUserId, followingId: u.id },
          });
          isFollowing = !!follow;
        }

        return {
          id: u.id,
          userName: u.userName,
          fullName: u.fullName,
          avatar: u.profile?.avatar || '',
          followersCount,
          isFollowing,
        };
      }),
    );

    return new PagedResult(items, totalCount, pageNumber, pageSize);
  }

  async findOne(id: number, currentUserId?: number): Promise<UserDetailDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { profile: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
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
    if (currentUserId) {
      const follow = await this.followRepository.findOne({
        where: { followerId: currentUserId, followingId: user.id },
      });
      isFollowing = !!follow;
    }

    return {
      id: user.id,
      userName: user.userName,
      fullName: user.fullName,
      // E-mail addresses are private: only the owner sees their own.
      email: currentUserId === user.id ? user.email : '',
      bio: user.profile?.bio || '',
      avatar: user.profile?.avatar || '',
      website: user.profile?.website || '',
      gender: user.profile?.gender ?? 0,
      isPrivate: user.profile?.isPrivate ?? false,
      followersCount,
      followingCount,
      postsCount,
      isFollowing,
      createdAt: user.createdAt,
    };
  }

  async deleteMe(userId: number): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(userId);
    return 'Your account has been deleted successfully';
  }
}
