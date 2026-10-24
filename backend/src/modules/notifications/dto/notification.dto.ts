import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type NotificationType = 'follow' | 'like' | 'comment' | 'story_like';

export class NotificationActorDto {
  @ApiProperty({ example: 2 })
  id!: number;

  @ApiProperty({ example: 'maria_art' })
  userName!: string;

  @ApiProperty({ example: 'Maria Ivanova' })
  fullName!: string;

  @ApiProperty({ example: '/uploads/maria.jpg' })
  avatar!: string;

  @ApiProperty({ description: 'The current user follows this person' })
  isFollowing!: boolean;
}

export class NotificationTargetDto {
  @ApiProperty({ description: 'Post the notification is about (absent for follows and story likes)' })
  postId?: number;

  @ApiProperty({ description: 'Preview image or video of the post / story' })
  image?: string;
}

export class NotificationDto {
  @ApiProperty({ example: 'like-15', description: 'Stable key: <type>-<row id>' })
  id!: string;

  @ApiProperty({ enum: ['follow', 'like', 'comment', 'story_like'] })
  type!: NotificationType;

  @ApiProperty({ type: NotificationActorDto })
  actor!: NotificationActorDto;

  @ApiPropertyOptional({ description: 'Comment text for type `comment`' })
  text?: string;

  @ApiPropertyOptional({ type: NotificationTargetDto })
  target?: NotificationTargetDto;

  @ApiProperty()
  createdAt!: Date;
}
