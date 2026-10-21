import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccountController } from './account.controller.js';
import { AccountService } from './account.service.js';
import { JwtStrategy } from './jwt.strategy.js';
import { User } from '../../entities/user.entity.js';
import { Profile } from '../../entities/profile.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'instagram-super-secret-key-2026',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AccountController],
  providers: [AccountService, JwtStrategy],
  exports: [AccountService, JwtModule, PassportModule],
})
export class AccountModule {}
