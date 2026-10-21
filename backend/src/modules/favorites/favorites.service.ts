import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../../entities/favorite.entity.js';
import { Post } from '../../entities/post.entity.js';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async addFavorite(postId: number, userId: number): Promise<string> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const existing = await this.favoriteRepository.findOne({
      where: { postId, userId },
    });
    if (existing) {
      throw new ConflictException('Post is already in favorites');
    }

    const fav = this.favoriteRepository.create({ postId, userId });
    await this.favoriteRepository.save(fav);

    return 'Post added to favorites';
  }

  async removeFavorite(postId: number, userId: number): Promise<string> {
    const existing = await this.favoriteRepository.findOne({
      where: { postId, userId },
    });
    if (!existing) {
      throw new NotFoundException('Post is not in favorites');
    }

    await this.favoriteRepository.delete(existing.id);
    return 'Post removed from favorites';
  }
}
