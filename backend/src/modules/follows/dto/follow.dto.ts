import { ApiProperty } from '@nestjs/swagger';

export class FollowUserDto {
  @ApiProperty({ example: 2 })
  userId!: number;

  @ApiProperty({ example: 'maria_art' })
  userName!: string;

  @ApiProperty({ example: 'Maria Ivanova' })
  fullName!: string;

  @ApiProperty({ example: '/uploads/maria.jpg' })
  avatar!: string;

  @ApiProperty({ example: true })
  isFollowing!: boolean;
}
