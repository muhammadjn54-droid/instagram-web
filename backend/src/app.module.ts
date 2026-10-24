import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';

import { databaseConfig } from './config/database.config.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';

import { AccountModule } from './modules/account/account.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { ProfilesModule } from './modules/profiles/profiles.module.js';
import { FollowsModule } from './modules/follows/follows.module.js';
import { PostsModule } from './modules/posts/posts.module.js';
import { CommentsModule } from './modules/comments/comments.module.js';
import { FavoritesModule } from './modules/favorites/favorites.module.js';
import { StoriesModule } from './modules/stories/stories.module.js';
import { ChatsModule } from './modules/chats/chats.module.js';
import { LocationsModule } from './modules/locations/locations.module.js';
import { SearchHistoryModule } from './modules/search-history/search-history.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AccountModule,
    UsersModule,
    ProfilesModule,
    FollowsModule,
    PostsModule,
    CommentsModule,
    FavoritesModule,
    StoriesModule,
    ChatsModule,
    LocationsModule,
    SearchHistoryModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
