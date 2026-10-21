import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Awesome shot! Beautiful mountains!',
    description: 'Comment text content (1 - 500 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  comment!: string;
}

export class CommentDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  postId!: number;

  @ApiProperty({ example: 2 })
  userId!: number;

  @ApiProperty({ example: 'maria_art' })
  userName!: string;

  @ApiProperty({ example: '/uploads/maria.jpg' })
  userAvatar!: string;

  @ApiProperty({ example: 'Awesome shot!' })
  content!: string;

  @ApiProperty({ example: '2026-10-21T12:00:00.000Z' })
  createdAt!: Date;
}
