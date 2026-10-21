import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './user.entity.js';
import { Location } from './location.entity.js';
import { PostImage } from './post-image.entity.js';
import { PostLike } from './post-like.entity.js';
import { PostView } from './post-view.entity.js';
import { Comment } from './comment.entity.js';
import { Favorite } from './favorite.entity.js';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column({ nullable: true })
  locationId?: number;

  @Column({ nullable: true })
  title?: string;

  @Column({ default: '' })
  content!: string;

  @Column({ default: false })
  isReel!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: Relation<User>;

  @ManyToOne(() => Location, (location) => location.posts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'locationId' })
  location?: Relation<Location>;

  @OneToMany(() => PostImage, (image) => image.post, { cascade: true })
  images?: Relation<PostImage>[];

  @OneToMany(() => PostLike, (like) => like.post, { cascade: true })
  likes?: Relation<PostLike>[];

  @OneToMany(() => PostView, (view) => view.post, { cascade: true })
  views?: Relation<PostView>[];

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments?: Relation<Comment>[];

  @OneToMany(() => Favorite, (favorite) => favorite.post, { cascade: true })
  favorites?: Relation<Favorite>[];
}
