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
import { Post } from './post.entity.js';
import { User } from './user.entity.js';

@Entity('favorites')
@Unique(['postId', 'userId'])
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  postId!: number;

  @Column()
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Post, (post) => post.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post?: Relation<Post>;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: Relation<User>;
}
