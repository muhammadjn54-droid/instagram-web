import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchHistoryService } from './search-history.service.js';
import {
  CreateSearchHistoryDto,
  SearchHistoryItemDto,
} from './dto/search-history.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import {
  ApiOkWrapped,
  ApiCreatedWrapped,
  ApiErrorResponses,
} from '../../common/decorators/swagger-wrapped.decorator.js';

@ApiTags('SearchHistory')
@ApiBearerAuth('Bearer')
@ApiErrorResponses()
@Controller('search-history')
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a search record to history' })
  @ApiCreatedWrapped(SearchHistoryItemDto)
  async create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateSearchHistoryDto,
  ) {
    return this.searchHistoryService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user search history' })
  @ApiOkWrapped(SearchHistoryItemDto)
  async findAll(@CurrentUser('id') userId: number) {
    return this.searchHistoryService.findAll(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a single search record by ID' })
  @ApiOkWrapped()
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.searchHistoryService.remove(id, userId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all search history for current user' })
  @ApiOkWrapped()
  async clearAll(@CurrentUser('id') userId: number) {
    return this.searchHistoryService.clearAll(userId);
  }
}
