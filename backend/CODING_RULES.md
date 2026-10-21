# CODING RULES — Instagram-like Social Network API

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Tooling | Prettier (single quotes, trailing commas), oxlint, TypeScript `strict: true` |
| Style | NestJS + ESM (`"type": "module"`), NodeNext resolution, `.js` suffix on every relative import |

Rules 1, 4, 5, 7, 9 and 11 show a full example. The other rules use a short
good / bad pair.

## 1. Naming

File kebab-case, one class per file. Class PascalCase, no `I` prefix, no `Impl`
suffix. Method verb + noun, camelCase. Boolean starts with `is` / `has`.
Constant SCREAMING_SNAKE_CASE.

```ts
// GOOD
async addFavorite(userId: number, postId: number): Promise<Favorite> {
  return this.favorites.save(this.favorites.create({ userId, postId }));
}

// BAD
async add_favorite(userId: number, postId: number): Promise<Favorite> {
  return this.favorites.save(this.favorites.create({ userId, postId }));
}
```

## 2. Imports (ESM)

- GOOD: `import { Favorite } from '../../entities/index.js';` + `import type { CreateFavoriteDto } from './dto/create-favorite.dto.js';`
- BAD: `import { Favorite } from '../../entities/favorite.entity';` — no `.js`, no barrel file.

## 3. No `any`

`any` and `@ts-ignore` are banned. Use a real type, `unknown` + a type guard, or a generic.

- GOOD: `const body: unknown = request.body; if (typeof body === 'object' && body !== null && 'postId' in body) { ... }`
- BAD: `const body: any = request.body;` and `// @ts-ignore`

## 4. DTOs

One DTO class per file, in `dto/`. Every property has a class-validator
decorator **and** `@ApiProperty` / `@ApiPropertyOptional` with description and
example. No business logic inside a DTO.

```ts
// GOOD
export class CreateFavoriteDto {
  @ApiProperty({ example: 12, description: 'Id of the post to save' })
  @IsInt() @Min(1)
  postId!: number;
}

// BAD
export class FavoriteDto {
  postId: number; // no validator, no @ApiProperty
}
```

## 5. Validation pipe

One global pipe in `main.ts`, not per route. `whitelist` removes unknown fields,
`forbidNonWhitelisted` rejects them, `transform` converts the payload.

```ts
// GOOD — in main.ts
app.useGlobalPipes(
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
);

// BAD — in the controller
@Post() add(@Body() body: any) {
  return this.favoritesService.add(body.postId); // no validation at all
}
```

## 6. Errors

Throw the Nest exceptions. Never return an error object as a success answer, and
never send a raw `Error` to the client.

- GOOD: `if (!post) throw new NotFoundException('Post not found');` and `if (existing) throw new ConflictException('Already saved');`
- BAD: `if (!post) return { data: null, errors: ['Post not found'], statusCode: 404 };`

## 7. Status codes

| Code | When |
|---|---|
| 200 | read, update, delete, and any action that only changes a state |
| 201 | a resource was created (post, comment, story, location) |
| 400 | validation error or a broken business rule |
| 401 | no token, expired token, wrong password |
| 403 | the caller is authenticated but not allowed |
| 404 | the resource does not exist |
| 409 | the resource already exists |
| 413 | the uploaded file is too large |
| 429 | too many requests |

```ts
// GOOD
@Post()
@HttpCode(HttpStatus.CREATED)
async add(@CurrentUser('id') userId: number, @Body() dto: CreateFavoriteDto) {
  return this.favoritesService.add(userId, dto);
}

// BAD — creates a resource but answers 200
@Post()
async add(@CurrentUser('id') userId: number, @Body() dto: CreateFavoriteDto) {
  return this.favoritesService.add(userId, dto);
}
```

## 8. Response shape

Every answer uses the same wrapper. The service returns plain data; the
interceptor wraps it. If the service already returns the wrapper, the
interceptor leaves it alone.

- GOOD: `async getById(id: number): Promise<Post> { const post = await this.posts.findOne({ where: { id } }); if (!post) throw new NotFoundException('Post not found'); return post; }`
- BAD: `return { statusCode: 200, data: post, errors: null };` — the service builds the HTTP body.

## 9. Pagination

Every list endpoint takes `pageNumber` (≥1, default 1) and `pageSize`
(1…100, default 10) and answers with `PagedResult<T>`.

```ts
// GOOD
const [items, totalCount] = await this.posts.findAndCount({
  skip: (pageNumber - 1) * pageSize,
  take: pageSize,
  order: { createdAt: 'DESC' },
});
return new PagedResult(items, totalCount, pageNumber, pageSize);

// BAD — no paging, no total, breaks at 10 000 rows
async list() { return this.posts.find(); }
```

## 10. The current user

The user id always comes from the JWT through `@CurrentUser()`. It is never read
from the body, the query or a path parameter.

- GOOD: `async add(@CurrentUser('id') userId: number, @Body() dto: CreateFavoriteDto)`
- BAD: `async add(@Body() dto: { userId: number })` — a client can impersonate anybody.

## 11. File upload

`multipart/form-data`, `FilesInterceptor` or `FileInterceptor`, a size limit in
bytes, a mime-type whitelist, and a random file name.

```ts
// GOOD
@UseInterceptors(
  FileInterceptor('image', {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) =>
      cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
  }),
)
async create(@UploadedFile() file: Express.Multer.File) { return this.postsService.create(file); }

// BAD — no size limit, no type check, path injection
async create(@UploadedFile() file: Express.Multer.File) { return this.postsService.create(file.originalname); }
```

## 12. Thin controller

The controller validates the input and calls the service. No repository call, no
business rule.

- GOOD: `async remove(@CurrentUser('id') userId: number, @Param('postId', ParseIntPipe) postId: number) { return this.postsService.remove(userId, postId); }`
- BAD: the controller calls `this.posts.findOne(...)`, checks the owner and deletes — the logic belongs in the service.

## 13. Entities

One entity per file in `src/entities/`, exported through `index.ts`. A relation
always declares `onDelete`. A join table has a `@Unique` on the pair.

- GOOD: `@ManyToOne(() => Post, (post) => post.favorites, { onDelete: 'CASCADE' })` + `@Unique(['postId', 'userId'])`
- BAD: `@ManyToOne(() => Post)` — no inverse side, no `onDelete`, no unique pair.

## 14. Comments

Comments explain **why**, not **what**. A `TODO` names the task, e.g.
`// TODO(TASKS.md Account #12): hash the password`.

- GOOD: `// The unique pair is enforced by the database, so a race cannot create two rows.`
- BAD: `// loop over the favorites and find the one we need`
