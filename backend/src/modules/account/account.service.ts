import {
  Injectable,
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

@Injectable()
export class AccountService {
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
    await this.userRepository.update(userId, { refreshToken: undefined });
    return 'Logged out successfully';
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    return `Password reset token has been generated: reset-token-${user.id}`;
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

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.userRepository.update(user.id, { password: hashedPassword });

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
    const refreshToken = `ref-${user.id}-${Date.now()}`;

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
