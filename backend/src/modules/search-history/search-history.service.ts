import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from '../../entities/search-history.entity.js';
import type {
  CreateSearchHistoryDto,
  SearchHistoryItemDto,
} from './dto/search-history.dto.js';

@Injectable()
export class SearchHistoryService {
  constructor(
    @InjectRepository(SearchHistory)
    private readonly searchHistoryRepository: Repository<SearchHistory>,
  ) {}

  async create(
    userId: number,
    dto: CreateSearchHistoryDto,
  ): Promise<SearchHistoryItemDto> {
    const item = this.searchHistoryRepository.create({
      userId,
      text: dto.text,
      searchedUserId: dto.searchedUserId,
    });
    const saved = await this.searchHistoryRepository.save(item);

    return this.findOne(saved.id, userId);
  }

  async findAll(userId: number): Promise<SearchHistoryItemDto[]> {
    const items = await this.searchHistoryRepository.find({
      where: { userId },
      relations: { searchedUser: { profile: true } },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return items.map((i) => ({
      id: i.id,
      userId: i.userId,
      text: i.text,
      searchedUserId: i.searchedUserId,
      searchedUserName: i.searchedUser?.userName,
      searchedUserAvatar: i.searchedUser?.profile?.avatar || '',
      createdAt: i.createdAt,
    }));
  }

  async findOne(id: number, userId: number): Promise<SearchHistoryItemDto> {
    const item = await this.searchHistoryRepository.findOne({
      where: { id, userId },
      relations: { searchedUser: { profile: true } },
    });

    if (!item) {
      throw new NotFoundException('Search history item not found');
    }

    return {
      id: item.id,
      userId: item.userId,
      text: item.text,
      searchedUserId: item.searchedUserId,
      searchedUserName: item.searchedUser?.userName,
      searchedUserAvatar: item.searchedUser?.profile?.avatar || '',
      createdAt: item.createdAt,
    };
  }

  async remove(id: number, userId: number): Promise<string> {
    const item = await this.searchHistoryRepository.findOne({
      where: { id, userId },
    });
    if (!item) {
      throw new NotFoundException('Search history item not found');
    }
    await this.searchHistoryRepository.delete(id);
    return 'Search history item deleted';
  }

  async clearAll(userId: number): Promise<string> {
    await this.searchHistoryRepository.delete({ userId });
    return 'Search history cleared successfully';
  }
}
