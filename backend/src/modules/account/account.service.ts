import { createHash, randomBytes } from 'node:crypto';
import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity.js';
import { Profile } from '../../entities/profile.entity.js';
import type {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AuthResponseDto,
} from './dto/account.dto.js';

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<string> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.userRepository.findOne({
      where: [{ userName: dto.userName }, { email: dto.email }],
    });

    if (existingUser) {
      if (existingUser.userName === dto.userName) {
        throw new ConflictException('Username already taken');
      }
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      userName: dto.userName,
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);

    const profile = this.profileRepository.create({
      userId: savedUser.id,
      bio: '',
      avatar: '',
      website: '',
    });
    await this.profileRepository.save(profile);

    return 'User registered successfully';
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: [{ userName: dto.userName }, { email: dto.userName }],
      relations: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { refreshToken: dto.refreshToken },
      relations: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateTokens(user);
  }

  async logout(userId: number): Promise<string> {
    await this.userRepository.update(userId, { refreshToken: null });
    return 'Logged out successfully';
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    // There is no mail service: the token is written to the server log (the
    // "mailbox" of the developer) and, outside production only, returned in
    // the response so the reset flow stays usable in the UI.
    const token = randomBytes(24).toString('hex');
    await this.userRepository.update(user.id, {
      resetTokenHash: hashToken(token),
      resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });
    this.logger.log(`Password reset token for ${user.email}: ${token}`);

    if (process.env.NODE_ENV === 'production') {
      return 'If this e-mail is registered, a reset token has been sent';
    }
    return `Password reset token has been generated: ${token}`;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<string> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tokenIsValid =
      !!user.resetTokenHash &&
      !!user.resetTokenExpiresAt &&
      user.resetTokenExpiresAt.getTime() > Date.now() &&
      user.resetTokenHash === hashToken(dto.token);

    if (!tokenIsValid) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    // The token is single use; any open session is revoked with the old password.
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      refreshToken: null,
    });

    return 'Password reset successfully';
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<string> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password does not match');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.userRepository.update(user.id, { password: hashedPassword });

    return 'Password changed successfully';
  }

  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      userName: user.userName,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = `ref-${randomBytes(32).toString('hex')}`;

    await this.userRepository.update(user.id, { refreshToken });

    return {
      accessToken,
      refreshToken,
      expiresAt: 86400,
      user: {
        id: user.id,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        avatar: user.profile?.avatar || '',
      },
    };
  }
}
