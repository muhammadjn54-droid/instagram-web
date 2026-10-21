import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Story } from './story.entity.js';
import { User } from './user.entity.js';

@Entity('story_likes')
@Unique(['storyId', 'userId'])
export class StoryLike {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  storyId!: number;

  @Column()
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Story, (story) => story.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storyId' })
  story?: Relation<Story>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: Relation<User>;
}
