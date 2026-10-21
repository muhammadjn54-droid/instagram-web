import { Body, Controller, Post, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountService } from './account.service.js';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AuthResponseDto,
} from './dto/account.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import {
  ApiOkWrapped,
  ApiCreatedWrapped,
  ApiErrorResponses,
} from '../../common/decorators/swagger-wrapped.decorator.js';

@ApiTags('Account')
@ApiBearerAuth('Bearer')
@ApiErrorResponses()
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiCreatedWrapped()
  async register(@Body() dto: RegisterDto) {
    return this.accountService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with username and password' })
  @ApiOkWrapped(AuthResponseDto)
  async login(@Body() dto: LoginDto) {
    return this.accountService.login(dto);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT access token using refresh token' })
  @ApiOkWrapped(AuthResponseDto)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.accountService.refreshToken(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out current user' })
  @ApiOkWrapped()
  async logout(@CurrentUser('id') userId: number) {
    return this.accountService.logout(userId);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset token via email' })
  @ApiOkWrapped()
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.accountService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token and email' })
  @ApiOkWrapped()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.accountService.resetPassword(dto);
  }

  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password for currently logged-in user' })
  @ApiOkWrapped()
  async changePassword(
    @CurrentUser('id') userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.accountService.changePassword(userId, dto);
  }
}
