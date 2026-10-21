# ARCHITECTURE — Instagram-like Social Network API

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Style | modular monolith, Controller → Service → Entity |
| Runtime | NestJS 12, ESM (`"type": "module"`), NodeNext, `.js` import suffix |

## 1. Real folder tree of `src/`

```text
src/
├── main.ts                     # bootstrap: CORS + Swagger + listen(3000)
├── app.module.ts               # root module: AccountModule + ObserveModule
├── app.controller.ts           # GET / -> "Hello World!"
├── app.service.ts              # getHello()
├── app.controller.spec.ts      # unit test for the root controller
├── common/
│   ├── decorators/             # current-user, public, swagger-wrapped
│   ├── filters/                # http-exception.filter.ts -> {statusCode,data,errors}
│   ├── guards/                 # jwt-auth.guard.ts -> AuthGuard('jwt') + @Public()
│   ├── interceptors/           # response.interceptor.ts -> wraps into ApiResponse
│   ├── responses/              # api-response.ts -> ApiResponse, PagedResult, ErrorResponseDto
│   ├── dto/                    # EMPTY - reserved
│   └── utils/                  # EMPTY - reserved
├── config/
│   └── database.config.ts      # TypeORM options (sqlite) - NOT wired yet
├── entities/                   # 16 entities + index.ts barrel
│   ├── index.ts                # export * from every entity
│   └── user, profile, follow, location, post, post-image, post-like,
│       post-view, comment, favorite, story, story-like, story-view,
│       chat, message, search-history  (.entity.ts)
├── modules/
│   ├── account/                # THE ONLY MODULE WITH CODE
│   │   ├── account.controller.ts   # 5 legacy routes
│   │   ├── account.service.ts      # in-memory array, no DB
│   │   ├── account.module.ts
│   │   ├── jwt.strategy.ts         # passport-jwt strategy
│   │   └── dto/                    # login.dto.ts, register.dto.ts (no validators)
│   ├── comments/ favorites/ follows/ posts/ profiles/ search-history/
│   ├── stories/ user/ user-profile/ users/      # only dto/ sub-folders, EMPTY
├── swagger.document.ts         # static OpenAPI document served by Swagger
├── swagger.json                # same content, JSON
├── swagger.old.json            # feature reference: 57 legacy .NET routes
└── abaut.md                    # the same legacy spec in Markdown
```

Not in `src/` but needed: `test/app.e2e-spec.ts`, `data/` (SQLite file),
`uploads/` (uploaded files), `backend/package.json`, `backend/nest-cli.json`.
`src/modules/chats/` and `src/modules/locations/` do not exist yet.

## 2. Request flow

```text
HTTP request
   ▼
[1] Middleware    CORS (app.enableCors() in main.ts)
   ▼
[2] Guards        JwtAuthGuard -> 401 unless @Public()   (NOT REGISTERED YET)
   ▼
[3] Pipes         ValidationPipe (whitelist, forbidNonWhitelisted)  (NOT REGISTERED YET)
   ▼
[4] Controller    @Controller('favorites') + @Post() reads @Body/@Query/@Param/@CurrentUser
   ▼
[5] Service       business logic, throws NestHttpException, uses the TypeORM repository
   ▼
[6] Repository    TypeORM query -> SQLite file data/app.sqlite
   ▼
[7] Interceptor   ResponseInterceptor -> {statusCode, data, errors}   (NOT REGISTERED YET)
   ▼
[8] Filter        HttpExceptionFilter -> {statusCode, data:null, errors[]}  (NOT REGISTERED YET)
   ▼
HTTP response
```

Steps 2, 3, 7 and 8 exist as files but are **not registered** — this is RISK-003
and it is why every endpoint answers without authentication today.

## 3. Where each piece lives

| Piece | File | Registered? |
|---|---|---|
| Guard | `src/common/guards/jwt-auth.guard.ts` | NO — add `APP_GUARD` in `app.module.ts` |
| Pipe | no file — use `new ValidationPipe({whitelist:true, forbidNonWhitelisted:true})` | NO — add `APP_PIPE` |
| Filter | `src/common/filters/http-exception.filter.ts` | NO — add `APP_FILTER` |
| Interceptor | `src/common/interceptors/response.interceptor.ts` | NO — add `APP_INTERCEPTOR` |
| Response wrapper | `src/common/responses/api-response.ts` | used by the interceptor |
| Swagger helpers | `src/common/decorators/swagger-wrapped.decorator.ts` | used per controller |
| Public marker | `src/common/decorators/public.decorator.ts` | used by the guard |
| Current user | `src/common/decorators/current-user.decorator.ts` | used per controller |
| JWT strategy | `src/modules/account/jwt.strategy.ts` | NO — `AccountModule` does not provide it |

## 4. Request flow in the real code today

```text
POST /Account/login
   ▼
AccountController.login(@Body() dto: LoginDto)
   │  no guard, no pipe, only @ApiTags('Account')
   ▼
AccountService.login(dto)
   │  finds the user in the array `this.users`, compares the plain-text password,
   │  returns {data, errors, statusCode}
   ▼
JSON body directly (no interceptor, no filter)
```

## 5. Recipe: how to add a new module

Example: the `favorites` module. Six steps, the same order every time.

**Step 1 — the folder.** `src/modules/favorites/` with `dto/create-favorite.dto.ts`,
`favorites.controller.ts`, `favorites.service.ts`, `favorites.module.ts`.

**Step 2 — the DTO.** Every field gets a validator and `@ApiProperty`.

```ts
export class CreateFavoriteDto {
  @ApiProperty({ example: 12, description: 'Id of the post to save' })
  @IsInt()
  @Min(1)
  postId!: number;
}
```

**Step 3 — the service.** It throws the Nest exceptions and uses the repository.

```ts
@Injectable()
export class FavoritesService {
  constructor(@InjectRepository(Favorite) private readonly favorites: Repository<Favorite>) {}

  async add(userId: number, dto: CreateFavoriteDto) {
    const existing = await this.favorites.findOne({ where: { postId: dto.postId, userId } });
    if (existing) throw new ConflictException('Already saved');
    return this.favorites.save(this.favorites.create({ postId: dto.postId, userId }));
  }
}
```

**Step 4 — the controller.** Thin: read the input, call the service.

```ts
@ApiTags('Favorites')
@ApiBearerAuth('bearer')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Save a post into favorites' })
  @ApiCreatedWrapped()
  @ApiErrorResponses()
  add(@CurrentUser('id') userId: number, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.add(userId, dto);
  }
}
```

**Step 5 — the module and the registration.**

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Favorite])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
```

In `app.module.ts`: `imports: [TypeOrmModule.forRoot(databaseConfig), FavoritesModule, AccountModule]`.

**Step 6 — update the docs.**

| File | Change |
|---|---|
| `API_CONTRACT.md` | change the status of the endpoint from TODO to DONE |
| `docs/TZ.md` | change the status of the matching FR |
| `docs/TRACEABILITY.md` | update the status of the row |
| `TASKS.md` | tick the box of the task, move the next task up |
| `CHANGELOG.md` | add one line under the current version |

## 6. Conventions of the codebase

| Topic | Convention in this repo |
|---|---|
| Imports | always with the `.js` suffix (`./dto/login.dto.js`) because of ESM + NodeNext |
| Types | `import type { X } from ...` for type-only imports |
| Entities | imported through the barrel `../../entities/index.js` |
| Dependencies | `constructor(private readonly x: XService)` — never property injection |
| Errors | `throw new BadRequestException(...)`, `NotFoundException`, `ForbiddenException`, `ConflictException` |
| Answers | the service returns plain data; the interceptor wraps it into `{statusCode, data, errors}` |
| Method names | verb + noun, e.g. `getPostsByUserId`, `addFavorite`, `deletePost` |
| DTO files | one class per file, file name = class name in kebab-case |
| Module files | `<module>.module.ts`, `<module>.controller.ts`, `<module>.service.ts` |
