import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class CreateStoryDto {
  @ApiPropertyOptional({ example: 1, description: 'Optional post ID to link story to' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  postId?: number;
}

export class StoryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 'muhammad_2026' })
  userName!: string;

  @ApiProperty({ example: '/uploads/avatar.jpg' })
  userAvatar!: string;

  @ApiProperty({ example: '/uploads/story.jpg' })
  imageUrl!: string;

  @ApiPropertyOptional({ example: 5 })
  postId?: number;

  @ApiProperty({ example: 10 })
  likesCount!: number;

  @ApiProperty({ example: 45 })
  viewsCount!: number;

  @ApiProperty({ example: false })
  isLikedByMe!: boolean;

  @ApiProperty({ example: '2026-10-22T12:00:00.000Z' })
  expiresAt!: Date;

  @ApiProperty({ example: '2026-10-21T12:00:00.000Z' })
  createdAt!: Date;
}

export class StoryViewerDto {
  @ApiProperty({ example: 2 })
  userId!: number;

  @ApiProperty({ example: 'maria_art' })
  userName!: string;

  @ApiProperty({ example: '/uploads/maria.jpg' })
  userAvatar!: string;

  @ApiProperty({ example: '2026-10-21T13:00:00.000Z' })
  viewedAt!: Date;
}

export class UserStoriesGroupDto {
  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 'muhammad_2026' })
  userName!: string;

  @ApiProperty({ example: '/uploads/avatar.jpg' })
  userAvatar!: string;

  @ApiProperty({ type: [StoryDto] })
  stories!: StoryDto[];
}
