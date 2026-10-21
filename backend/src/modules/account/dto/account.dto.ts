import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'muhammad_2026', description: 'Unique username' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message: 'userName must contain only letters, numbers, dots, or underscores',
  })
  userName!: string;

  @ApiProperty({ example: 'Muhammad Rajabzoda', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 'muhammad@example.com', description: 'Valid email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!', description: 'Strong password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Password123!', description: 'Confirm password' })
  @IsString()
  @MinLength(6)
  confirmPassword!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'muhammad_2026', description: 'Username' })
  @IsString()
  @IsNotEmpty()
  userName!: string;

  @ApiProperty({ example: 'Password123!', description: 'Password' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh-token-xyz', description: 'Refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'muhammad@example.com', description: 'Registered email' })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-123', description: 'Reset token' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'muhammad@example.com', description: 'User email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'NewPassword123!', description: 'New password' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'NewPassword123!', description: 'Confirm new password' })
  @IsString()
  @MinLength(6)
  confirmPassword!: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!', description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @ApiProperty({ example: 'NewPassword123!', description: 'New password' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'NewPassword123!', description: 'Confirm new password' })
  @IsString()
  @MinLength(6)
  confirmPassword!: string;
}

export class UserSummaryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'muhammad_2026' })
  userName!: string;

  @ApiProperty({ example: 'Muhammad Rajabzoda' })
  fullName!: string;

  @ApiProperty({ example: 'muhammad@example.com' })
  email!: string;

  @ApiProperty({ example: '/uploads/avatar.jpg' })
  avatar?: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'jwt.access.token' })
  accessToken!: string;

  @ApiProperty({ example: 'jwt.refresh.token' })
  refreshToken!: string;

  @ApiProperty({ example: 86400 })
  expiresAt!: number;

  @ApiProperty({ type: UserSummaryDto })
  user!: UserSummaryDto;
}
