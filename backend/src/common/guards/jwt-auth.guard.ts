import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // Optional authentication: when a valid token is sent, `request.user`
      // is populated so `isLikedByMe` / `isFollowing` are personalised.
      // A missing or invalid token must never block a public route.
      try {
        await super.canActivate(context);
      } catch {
        // anonymous request
      }
      return true;
    }
    return (await super.canActivate(context)) as boolean;
  }
}
