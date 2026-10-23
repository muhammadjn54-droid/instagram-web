import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service.js';
import { NotificationDto } from './dto/notification.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import {
  ApiOkWrapped,
  ApiErrorResponses,
} from '../../common/decorators/swagger-wrapped.decorator.js';

@ApiTags('Notifications')
@ApiBearerAuth('Bearer')
@ApiErrorResponses()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Activity on my account: new followers, likes and comments on my posts, likes on my stories (newest first, up to 100)',
  })
  @ApiOkWrapped(NotificationDto)
  async findAll(@CurrentUser('id') userId: number) {
    return this.notificationsService.findAll(userId);
  }
}
