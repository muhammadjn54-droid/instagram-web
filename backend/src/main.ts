import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Instagram Clone API')
    .setDescription(
      'Instagram Clone REST API documentation powered by NestJS, TypeORM, and OpenAPI',
    )
    .setVersion('v1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'Bearer',
    )
    .addTag('Account', 'Authentication, registration, and password recovery')
    .addTag('Users', 'User search, profile viewing, and account deletion')
    .addTag('Profiles', 'User profile management, avatar upload, and favorites')
    .addTag('Follows', 'Follow and unfollow relationships')
    .addTag('Posts', 'Posts and reels, liking, viewing, and deletion')
    .addTag('Comments', 'Post comments management')
    .addTag('Favorites', 'Saved/favorite posts bookmarking')
    .addTag('Stories', '24-hour disappearing stories, views, and likes')
    .addTag('Chats', 'Direct messages and conversations')
    .addTag('Locations', 'Geographical locations and spots')
    .addTag('Notifications', 'Activity on my account: follows, likes, comments')
    .addTag('SearchHistory', 'Search queries and user search history')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
    },
    customSiteTitle: 'Instagram Clone API Docs',
  });

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
    },
    customSiteTitle: 'Instagram Clone API Docs',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Сервер запущен: http://localhost:${port}`);
  console.log(`📚 Swagger доступен: http://localhost:${port}/swagger или http://localhost:${port}/api`);
}
await bootstrap();
