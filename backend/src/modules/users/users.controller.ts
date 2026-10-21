import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UserQueryDto, UserListItemDto, UserDetailDto } from './dto/user.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import {
  ApiOkWrapped,
  ApiPagedWrapped,
  ApiErrorResponses,
} from '../../common/decorators/swagger-wrapped.decorator.js';

@ApiTags('Users')
@ApiBearerAuth('Bearer')
@ApiErrorResponses()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get list of users with pagination and search' })
  @ApiPagedWrapped(UserListItemDto)
  async findAll(
    @Query() query: UserQueryDto,
    @CurrentUser('id') currentUserId?: number,
  ) {
    return this.usersService.findAll(query, currentUserId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiOkWrapped(UserDetailDto)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') currentUserId?: number,
  ) {
    return this.usersService.findOne(id, currentUserId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete currently authenticated user account' })
  @ApiOkWrapped()
  async deleteMe(@CurrentUser('id') userId: number) {
    return this.usersService.deleteMe(userId);
  }
}
