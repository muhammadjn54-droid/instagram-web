import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender } from '../../../entities/profile.entity.js';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Muhammad Rajabzoda' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: 'muhammad_dev' })
  @IsString()
  @IsOptional()
  userName?: string;

  @ApiPropertyOptional({ example: 'Building Instagram Clone with NestJS' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://github.com/my-profile' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ enum: Gender, enumName: 'Gender', example: Gender.Male })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}

export class ProfileDetailDto {
  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 'muhammad_2026' })
  userName!: string;

  @ApiProperty({ example: 'Muhammad Rajabzoda' })
  fullName!: string;

  @ApiProperty({ example: 'Building awesome apps' })
  bio!: string;

  @ApiProperty({ example: '/uploads/avatar.jpg' })
  avatar!: string;

  @ApiProperty({ example: 'https://instagram.com' })
  website!: string;

  @ApiProperty({ enum: Gender, enumName: 'Gender', example: Gender.Male })
  gender!: Gender;

  @ApiProperty({ example: false })
  isPrivate!: boolean;

  @ApiProperty({ example: 150 })
  followersCount!: number;

  @ApiProperty({ example: 80 })
  followingCount!: number;

  @ApiProperty({ example: 25 })
  postsCount!: number;

  @ApiProperty({ example: false })
  isFollowing!: boolean;
}
