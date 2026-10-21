import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export class UserQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by username, fullname or email' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class UserListItemDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'muhammad_2026' })
  userName!: string;

  @ApiProperty({ example: 'Muhammad Rajabzoda' })
  fullName!: string;

  @ApiProperty({ example: '/uploads/avatar.jpg' })
  avatar!: string;

  @ApiProperty({ example: 42 })
  followersCount!: number;

  @ApiProperty({ example: false })
  isFollowing!: boolean;
}

export class UserDetailDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'muhammad_2026' })
  userName!: string;

  @ApiProperty({ example: 'Muhammad Rajabzoda' })
  fullName!: string;

  @ApiProperty({ example: 'muhammad@example.com' })
  email!: string;

  @ApiProperty({ example: 'Junior Frontend Developer | React | TS' })
  bio!: string;

  @ApiProperty({ example: '/uploads/avatar.jpg' })
  avatar!: string;

  @ApiProperty({ example: 'https://github.com' })
  website!: string;

  @ApiProperty({ example: 0, description: '0: Male, 1: Female' })
  gender!: number;

  @ApiProperty({ example: false })
  isPrivate!: boolean;

  @ApiProperty({ example: 100 })
  followersCount!: number;

  @ApiProperty({ example: 50 })
  followingCount!: number;

  @ApiProperty({ example: 12 })
  postsCount!: number;

  @ApiProperty({ example: false })
  isFollowing!: boolean;

  @ApiProperty({ example: '2026-10-21T12:00:00.000Z' })
  createdAt!: Date;
}
