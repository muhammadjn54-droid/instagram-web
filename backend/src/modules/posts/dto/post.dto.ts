import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export class PostQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by author user ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  userId?: number;

  @ApiPropertyOptional({ description: 'Filter by title search keyword' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Filter only reels (short videos)' })
  @Transform(({ obj, key }) =>
    obj[key] === undefined ? undefined : ['true', '1', true].includes(obj[key]),
  )
  @IsBoolean()
  @IsOptional()
  isReel?: boolean;
}

export class CreatePostDto {
  @ApiPropertyOptional({ example: 'My first trip to Dushanbe', description: 'Post title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Amazing nature and warm people! #tajikistan #mountains' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 1, description: 'Location ID' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  locationId?: number;

  @ApiPropertyOptional({ example: false, description: 'Whether this post is a reel' })
  @Transform(({ obj, key }) =>
    obj[key] === undefined ? undefined : ['true', '1', true].includes(obj[key]),
  )
  @IsBoolean()
  @IsOptional()
  isReel?: boolean;
}

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Updated trip title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated content description' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  locationId?: number;
}

export class PostLocationDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Dushanbe Central' })
  name!: string;

  @ApiPropertyOptional({ example: 'Dushanbe' })
  city?: string;

  @ApiPropertyOptional({ example: 'Tajikistan' })
  country?: string;
}

export class PostDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 'muhammad_2026' })
  userName!: string;

  @ApiProperty({ example: '/uploads/avatar.jpg' })
  userAvatar!: string;

  @ApiPropertyOptional({ example: 'My vacation trip' })
  title?: string;

  @ApiProperty({ example: 'Sunny day in the mountains!' })
  content!: string;

  @ApiProperty({ type: [String], example: ['/uploads/photo1.jpg', '/uploads/photo2.jpg'] })
  images!: string[];

  @ApiPropertyOptional({ type: PostLocationDto })
  location?: PostLocationDto;

  @ApiProperty({ example: 25 })
  likesCount!: number;

  @ApiProperty({ example: 5 })
  commentsCount!: number;

  @ApiProperty({ example: 120 })
  viewsCount!: number;

  @ApiProperty({ example: false })
  isLikedByMe!: boolean;

  @ApiProperty({ example: false })
  isFavoriteByMe!: boolean;

  @ApiProperty({ example: false })
  isReel!: boolean;

  @ApiProperty({ example: '2026-10-21T12:00:00.000Z' })
  createdAt!: Date;
}
