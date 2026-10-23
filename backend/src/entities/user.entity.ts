import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Profile } from './profile.entity.js';
import { Post } from './post.entity.js';
import { Story } from './story.entity.js';
import { Comment } from './comment.entity.js';
import { Favorite } from './favorite.entity.js';
import { Follow } from './follow.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  userName!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string | null;

  /** SHA-256 of the pending password-reset token (the raw token is never stored). */
  @Column({ type: 'varchar', nullable: true })
  resetTokenHash?: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetTokenExpiresAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile?: Relation<Profile>;

  @OneToMany(() => Post, (post) => post.user)
  posts?: Relation<Post>[];

  @OneToMany(() => Story, (story) => story.user)
  stories?: Relation<Story>[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments?: Relation<Comment>[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites?: Relation<Favorite>[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  following?: Relation<Follow>[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers?: Relation<Follow>[];
}
