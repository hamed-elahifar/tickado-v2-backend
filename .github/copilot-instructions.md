# Tickado V2 — Copilot Instructions

## Architecture Overview

NestJS backend (v11) with MongoDB (Mongoose), Redis (ioredis), and Bun runtime. Every feature module follows a strict **5-layer pattern**: Module → Controller → Service → Repository → Model, with DTOs in a `dto/` subfolder.

**Global guards** are registered via `APP_GUARD` in `AppModule` in this order: `ThrottlerGuard` → `JwtAuthGuard` → `RolesGuard`. All routes require JWT auth by default — use `@Public()` to opt out.

## Key Commands

| Task             | Command                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Dev (Bun watch)  | `bun dev`                                                                                       |
| Dev (Nest watch) | `bun start:dev`                                                                                 |
| Build            | `bun run build` (SWC via `nest build`)                                                          |
| Lint + fix       | `bun run lint`                                                                                  |
| Unit tests       | `bun test`                                                                                      |
| All E2E tests    | `bun run test:e2e` (uses `.env.test`)                                                           |
| Single E2E suite | `NODE_ENV=test jest --config ./test/jest-e2e.json test/<module>/<name>.e2e-spec.ts --runInBand` |
| Format           | `bun run format`                                                                                |

Production uses `bun run dist/main.js`. Docker builds with `oven/bun:1-alpine`.

## Module Structure — Follow This Pattern

When creating a new module `foo`:

```
src/modules/foo/
  foo.module.ts          # MongooseModule.forFeature, exports service + repository
  foo.controller.ts      # Extends BaseController mixin
  foo.service.ts         # Extends BaseService<FooDocument, CreateFooDto, UpdateFooDto>
  foo.repository.ts      # Extends BaseRepository<FooDocument> — inject model only
  foo.model.ts           # Mongoose schema class with @Schema/@Prop decorators
  dto/
    create-foo.dto.ts
    update-foo.dto.ts    # Usually: extends PartialType(CreateFooDto)
    index.ts             # Barrel re-export
```

### Generic Base Classes (`src/modules/common/generic/`)

- **`BaseRepository<T>`** — CRUD: `create`, `findOne`, `findAll`, `update`, `delete`, `upsert`. Handles duplicate key → `ConflictException`.
- **`BaseService<T, CreateDto, UpdateDto>`** — Delegates to repository. Adds `findOneSafe` (throws `NotFoundException`), ObjectId validation, projection normalization.
- **`BaseController(Entity, CreateDto, UpdateDto, name)`** — Mixin function returning a class with `POST /`, `GET /`, `GET /:id`, `PATCH /:id` endpoints auto-documented with Swagger.

Concrete repositories/services should be thin — add custom methods only when the base class is insufficient.

## Auth & Roles

- **JWT login**: OTP via SMS (phone + code) or email + password. Token payload: `{ userID, username, roles }`.
- **`@Public()`** — Skips JWT auth. Apply to sign-up, sign-in, and any unauthenticated endpoints.
- **`@Roles(RolesEnum.ADMIN)`** — Requires at least one listed role. No decorator = open to all authenticated users.
- **`@GetJwt()`** — Param decorator extracting `JwtPayload` from the request user.
- **Roles**: `ADMIN`, `USER`, `UNDEFINED` (enum in `src/modules/auth/enums/roles.enum.ts`).

## DTO & Validation Conventions

- Decorate every property with both `class-validator` (`@IsString`, `@IsEnum`, etc.) AND `@ApiProperty`/`@ApiPropertyOptional` with `example` + `description`.
- Use `@Type(() => Number)` from `class-transformer` for query params that need numeric coercion.
- Pagination uses `PaginationQueryDto` from `src/modules/common/dto/pagination-query.dto.ts` (limit/offset with defaults 10/0).
- Global pipes: `whitelist: true`, `transform: true`, `forbidNonWhitelisted: false`.
- i18n validation messages supported — translation files in `src/i18n/{en,fa}/`.

## Response & Error Format

**All successful responses** are wrapped by `ResponseInterceptor`:

```json
{ "success": true, "statusCode": 200, "data": { ... }, "timestamp": "..." }
```

**All errors** go through `GlobalExceptionFilter`:

```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "...",
  "code": "DUPLICATE_KEY_ERROR",
  "timestamp": "..."
}
```

5xx errors are automatically sent to Telegram via `TelegramService`.

## Testing

- E2E tests use the **real `AppModule`** with a test DB (`.env.test`), not mocks.
- `PusherService` must be **overridden** in test setup: `.overrideProvider(PusherService).useValue({ trigger: jest.fn() })`.
- Auth helper pattern: sign up user → set role via direct DB → sign in with master code `'1234'` → get `accessToken`.
- Cleanup: `connection.dropDatabase()` or `deleteMany({})` in `afterEach`.
- A `MongoMemoryDatabase` utility exists in `src/modules/common/utils/mongodb-memory.ts` but is not yet used.

## External Services

| Service                 | Module                               | Config env vars                                                  |
| ----------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| MongoDB                 | `MongooseModule`                     | `MONGO_URL`                                                      |
| Redis                   | `src/modules/common/redis/` (global) | `REDIS_URL`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_TTL`             |
| Pusher (push notifs)    | `PushNotificationsModule` (global)   | `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` |
| SMS (OTP)               | `SmsModule`                          | `SMS_API_URL`, `SMS_API_KEY`, `SMS_SENDER`, `SMS_TEMPLATE`       |
| Telegram (error alerts) | `TelegramModule`                     | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`                         |
| Neshan (location)       | `LocationService`                    | `NESHAN_API_KEY`                                                 |

## Naming Conventions

- **Files**: `kebab-case` — `create-ticket.dto.ts`, `jwt-auth.guard.ts`
- **Classes**: `PascalCase` — `TicketService`, `CreateTicketDto`
- **Routes**: plural lowercase — `/tickets`, `/users`, `/notifs`
- **Enums**: `PascalCase` + `Enum` suffix or descriptive name — `RolesEnum`, `TicketStatus`
- **Models**: export both `Entity` class and `EntityDocument` type (`Entity & Document`)

## Swagger

Available at `/api-doc`. Every controller uses `@ApiTags(...)`, operations use `@ApiOperation({ summary })`, responses use `@ApiResponse`. Sensitive model fields use `@ApiHideProperty()` + `@Exclude()`.

## Redis Patterns

`BaseRedisRepository<T>` in `src/modules/common/redis/redis.repository.ts` provides key-value (`set`/`get`/`delete`), hash, and pub/sub operations. Keys are prefixed as `{prefix}:{id}` with configurable TTL. Throttle storage also uses Redis in production.
