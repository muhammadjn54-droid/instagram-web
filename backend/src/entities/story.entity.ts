import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './user.entity.js';
import { StoryLike } from './story-like.entity.js';
import { StoryView } from './story-view.entity.js';

@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  imageUrl!: string;

  @Column({ nullable: true })
  postId?: number;

  @Column({ type: 'datetime' })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.stories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: Relation<User>;

  @OneToMany(() => StoryLike, (like) => like.story, { cascade: true })
  likes?: Relation<StoryLike>[];

  @OneToMany(() => StoryView, (view) => view.story, { cascade: true })
  views?: Relation<StoryView>[];
}
