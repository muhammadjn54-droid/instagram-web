import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSearchHistoryDto {
  @ApiPropertyOptional({ example: 'tajikistan', description: 'Search text query' })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ example: 2, description: 'User ID clicked in search' })
  @IsInt()
  @IsOptional()
  searchedUserId?: number;
}

export class SearchHistoryItemDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiPropertyOptional({ example: 'tajikistan' })
  text?: string;

  @ApiPropertyOptional({ example: 2 })
  searchedUserId?: number;

  @ApiPropertyOptional({ example: 'alex_photo' })
  searchedUserName?: string;

  @ApiPropertyOptional({ example: '/uploads/alex.jpg' })
  searchedUserAvatar?: string;

  @ApiProperty({ example: '2026-10-21T12:00:00.000Z' })
  createdAt!: Date;
}
