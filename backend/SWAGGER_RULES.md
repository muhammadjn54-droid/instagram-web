# SWAGGER RULES — how every endpoint must be documented

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Helpers | `src/common/decorators/swagger-wrapped.decorator.ts` |
| UI | `/swagger` and `/api` (served by `main.ts`) |
| Current state | the served document is the **static** `src/swagger.document.ts`; decorator changes are invisible until `SwaggerModule.createDocument` is used (RISK-005) |

## 1. The template of a perfect controller method

Copy this block and fill the parts in `<>`.

```ts
import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiCreatedWrapped, ApiErrorResponses, ApiOkWrapped, ApiPagedWrapped,
} from '../../common/decorators/swagger-wrapped.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { FavoritesService } from './favorites.service.js';
import { CreateFavoriteDto } from './dto/create-favorite.dto.js';
import { FavoriteDto } from './dto/favorite.dto.js';

@ApiTags('Favorites')
@ApiBearerAuth('bearer')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({
    summary: 'Save a post into favorites',
    description:
      'Adds the post to the favorites of the signed-in user. The pair (postId, userId) is unique.',
  })
  @ApiCreatedWrapped(FavoriteDto)
  @ApiErrorResponses()
  async add(@CurrentUser('id') userId: number, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.add(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List the favorites of the signed-in user',
    description: 'Returns the saved posts, newest save first.',
  })
  @ApiQuery({ name: 'pageNumber', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiPagedWrapped(FavoriteDto)
  @ApiErrorResponses()
  async list(
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe) pageNumber: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.favoritesService.list(userId, pageNumber, pageSize);
  }
  // DELETE ':postId' — @ApiParam + @ApiOkWrapped + @ApiErrorResponses
  async remove(@CurrentUser('id') userId: number, @Param('postId', ParseIntPipe) postId: number) {
    return this.favoritesService.remove(userId, postId);
  }
}
```

### 1.1 The multipart variant

```ts
  @Post()
  @ApiOperation({
    summary: 'Publish a post with images',
    description: 'Accepts 1 to 10 images, each of at most 10 MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['images'],
      properties: {
        images: { type: 'array', items: { type: 'string', format: 'binary' } },
        title: { type: 'string', maxLength: 300, example: 'Sunset' },
        content: { type: 'string', maxLength: 2200, example: 'A nice evening' },
        locationId: { type: 'integer', example: 3 },
      },
    },
  })
  @ApiCreatedWrapped(PostDto)
  @ApiErrorResponses()
  async create(
    @CurrentUser('id') userId: number,
    @UseInterceptors(
      FilesInterceptor('images', 10, {
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) =>
          cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
      }),
    )
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(userId, dto, files);
  }
```
### 1.2 The public (no auth) variant

```ts
@ApiTags('Account')
@Controller('Account')
export class AccountController {
  @Post('login')
  @ApiOperation({
    summary: 'Log in and receive an access token',
    description: 'Public route. No Authorization header is needed.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkWrapped({})
  @ApiErrorResponses()
  async login(@Body() dto: LoginDto) {
    return this.accountService.login(dto);
  }
}
```

> A public route must be marked with `@Public()` **and** the Swagger block must
> not carry `@ApiBearerAuth`.

## 2. Which helper to use

| Situation | Helper | Result |
|---|---|---|
| read, update, delete, any action without a new resource | `@ApiOkWrapped(ModelDto)` | 200 + `data` = ModelDto |
| the endpoint creates a resource | `@ApiCreatedWrapped(ModelDto)` | 201 + `data` = ModelDto |
| the endpoint returns a list | `@ApiPagedWrapped(ModelDto)` | 200 + `data` = PagedResult |
| the endpoint returns nothing | `@ApiOkWrapped()` | 200 + `data` = object |
| any endpoint | `@ApiErrorResponses()` | 400, 401, 403, 404, 409 |

## 3. Checklist for one endpoint

Copy this list into the pull request or the task.

- [ ] `@ApiTags('Module')` on the controller class.
- [ ] `@ApiBearerAuth('bearer')` on the controller class, unless the route is public.
- [ ] `@Public()` on a public route, and no `@ApiBearerAuth` on that class.
- [ ] `@ApiOperation({summary, description})` — the summary is one line, the description explains the rules.
- [ ] `@ApiParam` for every path parameter, with an example.
- [ ] `@ApiQuery` for every query parameter, with an example.
- [ ] `@ApiBody` for the request body, or `@ApiProperty` on every DTO field.
- [ ] `@ApiConsumes('multipart/form-data')` + `@ApiBody` with `format: binary` for every upload.
- [ ] One success helper: `@ApiOkWrapped`, `@ApiCreatedWrapped` or `@ApiPagedWrapped`.
- [ ] `@ApiErrorResponses()` on every endpoint.
- [ ] The path follows the route policy: plural, kebab-case, id in the path.
- [ ] No password or token in a query parameter.
- [ ] The current user is taken from `@CurrentUser()`, not from the body.
- [ ] The status code matches the method: `POST` that creates → 201, otherwise 200.
- [ ] The endpoint exists in `API_CONTRACT.md` with the same path and method.
- [ ] `docs/TRACEABILITY.md` and `TASKS.md` are updated.

## 4. Global Swagger setup

```ts
// src/main.ts
const config = new DocumentBuilder()
  .setTitle('Instagram Clone API')
  .setDescription('REST API of the Instagram-like app')
  .setVersion('1.0')
  .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('swagger', app, document);
SwaggerModule.setup('api', app, document);
```

The served document today is the static `src/swagger.document.ts`
(a copy of the legacy `.NET` spec with 57 routes). It must be replaced by
`SwaggerModule.createDocument` so that the decorators become visible — see
`TASKS.md` → Platform → "Switch Swagger to a generated document".

## 5. The legacy document

| File | Role |
|---|---|
| `src/swagger.old.json` | feature reference, 57 legacy routes. **Not** a URL contract. |
| `src/about.md` | the same spec in Markdown |
| `src/swagger.json` | the same spec as JSON |
| `src/swagger.document.ts` | the same spec as a TypeScript object, served today |

Do not delete them and do not edit them by hand: they are the checklist of the
features to build. The real contract is `API_CONTRACT.md`.
