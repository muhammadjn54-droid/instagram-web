import {
  Controller,
  Get,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProfilesService } from './profiles.service.js';
import { UpdateProfileDto, ProfileDetailDto } from './dto/profile.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { multerImageOptions, getFileUrl } from '../../common/utils/multer.util.js';
import {
  ApiOkWrapped,
  ApiPagedWrapped,
  ApiErrorResponses,
} from '../../common/decorators/swagger-wrapped.decorator.js';

@ApiTags('Profiles')
@ApiBearerAuth('Bearer')
@ApiErrorResponses()
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkWrapped(ProfileDetailDto)
  async getMyProfile(@CurrentUser('id') userId: number) {
    return this.profilesService.getProfile(userId, userId);
  }

  @Public()
  @Get(':userId')
  @ApiOperation({ summary: 'Get user profile by user ID' })
  @ApiOkWrapped(ProfileDetailDto)
  async getUserProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser('id') currentUserId?: number,
  ) {
    return this.profilesService.getProfile(userId, currentUserId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile info' })
  @ApiOkWrapped(ProfileDetailDto)
  async updateProfile(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.updateProfile(userId, dto);
  }

  @Put('me/avatar')
  @ApiOperation({ summary: 'Upload avatar for current user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkWrapped()
  @UseInterceptors(FileInterceptor('image', multerImageOptions))
  async updateAvatar(
    @CurrentUser('id') userId: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const avatarUrl = getFileUrl(file.filename);
    return this.profilesService.updateAvatar(userId, avatarUrl);
  }

  @Delete('me/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove avatar from current user profile' })
  @ApiOkWrapped()
  async deleteAvatar(@CurrentUser('id') userId: number) {
    return this.profilesService.deleteAvatar(userId);
  }

  @Get('me/favorites')
  @ApiOperation({ summary: 'Get saved/favorite posts for current user' })
  @ApiPagedWrapped(Object)
  async getFavorites(
    @CurrentUser('id') userId: number,
    @Query() query: PaginationDto,
  ) {
    return this.profilesService.getFavorites(userId, query);
  }
}
