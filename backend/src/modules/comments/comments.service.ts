import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity.js';
import { Post } from '../../entities/post.entity.js';
import type { CreateCommentDto, CommentDto } from './dto/comment.dto.js';
import { PagedResult } from '../../common/responses/api-response.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(
    postId: number,
    userId: number,
    dto: CreateCommentDto,
  ): Promise<CommentDto> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const comment = this.commentRepository.create({
      postId,
      userId,
      content: dto.comment,
    });
    const saved = await this.commentRepository.save(comment);

    const full = await this.commentRepository.findOne({
      where: { id: saved.id },
      relations: { user: { profile: true } },
    });

    return {
      id: full!.id,
      postId: full!.postId,
      userId: full!.userId,
      userName: full!.user?.userName || '',
      userAvatar: full!.user?.profile?.avatar || '',
      content: full!.content,
      createdAt: full!.createdAt,
    };
  }

  async findByPost(
    postId: number,
    query: PaginationDto,
  ): Promise<PagedResult<CommentDto>> {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 10, 100);
    const skip = (pageNumber - 1) * pageSize;

    const [comments, totalCount] = await this.commentRepository.findAndCount({
      where: { postId },
      relations: { user: { profile: true } },
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    const items: CommentDto[] = comments.map((c) => ({
      id: c.id,
      postId: c.postId,
      userId: c.userId,
      userName: c.user?.userName || '',
      userAvatar: c.user?.profile?.avatar || '',
      content: c.content,
      createdAt: c.createdAt,
    }));

    return new PagedResult(items, totalCount, pageNumber, pageSize);
  }

  async remove(id: number, userId: number): Promise<string> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: { post: true },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    const isCommentOwner = comment.userId === userId;
    const isPostOwner = comment.post?.userId === userId;

    if (!isCommentOwner && !isPostOwner) {
      throw new ForbiddenException(
        'You can only delete your own comments or comments on your posts',
      );
    }

    await this.commentRepository.delete(id);
    return 'Comment deleted successfully';
  }
}
