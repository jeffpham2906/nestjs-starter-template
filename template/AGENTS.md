# Agent Instructions

This document provides guidelines for AI agents working on this project.

## Project Overview

This is a NestJS-based backend application with:

- **Framework**: NestJS 11.x with TypeScript 5.x
- **Database**: PostgreSQL with Prisma ORM 7.x
- **Testing**: Jest for unit and E2E tests
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- **Runtime**: SWC for fast compilation

## Architecture Guardrails (Read This First)

This project is intentionally **not** a “classic layered architecture” (Controller → Service → Repository across global folders).

When an AI agent plans or implements changes, follow these guardrails:

### Non-negotiables

- **Validation is Zod-first** via `nestjs-zod`.
  - Use `createZodDto(...)` for request/response DTOs.
  - Use Zod schemas (e.g., `SomeSchema.safeParse(...)`) for use case/command validation.
  - The app uses a global `ZodValidationPipe` and Zod exception filters.
- **Do NOT introduce `class-validator`, `class-transformer`, or Nest `ValidationPipe` patterns**.
  - Do not add decorator-based DTOs (`@IsString()`, `@IsOptional()`, etc.).
  - Do not propose installing class-validator/class-transformer “because Nest usually uses it”.
- **Feature-first (vertical slice) structure** under `src/features/...`.
  - Put a feature’s controller, use case, command schema, and DTOs together.
  - Put reusable domain/infrastructure parts for the feature under `_shared/`.
- **Ports/adapters + use cases are preferred**.
  - Use DI tokens (Symbols) for ports/use cases, and bind them in the feature modules.
- **Errors/results**: prefer explicit error types and `neverthrow` (`Result`, `ok`, `err`) inside domain/use cases.
  - Controllers translate domain errors into appropriate Nest exceptions.

### Defaults to assume

- HTTP adapter is **Fastify**.
- Logging uses `ILogger` + `ILoggerFactory` (don’t use `console.log`).
- Prisma access goes through the global `PrismaService` from `src/cross-cutting/db/prismaClient.ts`.

### Validation (Zod-First)

#### Request DTOs

Use `nestjs-zod` DTOs.

```typescript
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createThingRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export class CreateThingRequestDto extends createZodDto(
  createThingRequestSchema,
) {}
```

#### Use case / command validation

Even if the controller receives a validated DTO, validate the command at the use case boundary when it matters.

```typescript
const validated = CreateThingCommandSchema.safeParse(command);
if (!validated.success) {
  return err(new ValidationError('Invalid command', validated.error));
}
```

#### Avoid these patterns

- Do not add `@IsString()`, `@IsUUID()`, `@ValidateNested()`, etc.
- Do not add `class-validator` dependencies.
- Do not add `ValidationPipe` configuration.

### Feature Implementation Pattern

When implementing a new endpoint inside a feature, prefer a structure similar to:

- `src/features/<feature>/<use-case>/controller.ts` (HTTP mapping + exception translation)
- `src/features/<feature>/<use-case>/useCase.ts` (business flow, returns `Result`)
- `src/features/<feature>/<use-case>/command.ts` (Zod schema + types)
- `src/features/<feature>/<use-case>/request.dto.ts` and `response.dto.ts` (Zod DTOs)
- `src/features/<feature>/_shared/` (ports, adapters, mappers, domain entities/errors)

Conventions to follow in controllers:

- Prefer `@ZodResponse(...)` for Swagger response typing.
- Prefer returning standardized wrappers from `src/shared/types` (e.g. `createSuccessResponse(...)`).

If you’re unsure, search existing features (e.g. `specimen-management`) and copy the project’s patterns.

## Runtime Requirements

### Node.js and npm

This project requires specific versions:

```json
{
  "node": ">=20.0.0",
  "npm": ">=10.0.0"
}
```

**Always check `package.json` `engines` field before starting work.**

### Verify Versions

Before running any commands, verify you have the correct versions:

```bash
node --version  # Should be >= 20.0.0
npm --version   # Should be >= 10.0.0
```

## Development Workflow

### Available Scripts

#### Application

- `npm run build` - Build the application for production
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with watch
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start production build

#### Database (Prisma)

- `npm run prisma:generate` - Generate Prisma Client (run after schema changes)
- `npm run prisma:migrate` - Create and apply migration
- `npm run prisma:migrate:deploy` - Deploy migrations (production)
- `npm run prisma:migrate:reset` - Reset database
- `npm run prisma:seed` - Seed database with sample data
- `npm run prisma:format` - Format Prisma schema file

#### Testing

- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:debug` - Run tests in debug mode

#### Code Quality

- `npm run lint` - Lint and fix TypeScript code
- `npm run format` - Format code with Prettier

## Code Style and Conventions

### Dependency Injection Import Style

When a DI token and its interface share the same exported name (for example `IDateTimeProvider`), import it once and reuse that identifier for both `@Inject(...)` and the property type.

Preferred pattern:

```typescript
import { IDateTimeProvider } from '@cross-cutting/providers/datetime.provider';

constructor(
  @Inject(IDateTimeProvider)
  private readonly dateTimeProvider: IDateTimeProvider,
) {}
```

Avoid aliasing the same symbol into a second type-only name (for example `type IDateTimeProvider as IDateTimeProviderType`) unless there is a real naming collision.

### TypeScript Configuration

- **Target**: ES2023
- **Module**: CommonJS
- **Decorators**: Enabled (`experimentalDecorators: true`)
- **Strict Mode**: Enabled
- **Source Maps**: Enabled

### ESLint Rules

Key rules from `eslint.config.mjs`:

- TypeScript strict type checking enabled
- Floating promises treated as warnings (use `await` or handle promises)
- Prettier integration enforced
- `no-explicit-any` is **disabled** (any types allowed when necessary)

### Prettier Configuration

From `.prettierrc`:

```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

**Always use single quotes** for strings and **trailing commas** in objects/arrays.

### Pre-commit Hooks

Husky runs `lint-staged` on every commit. For each `.ts` file, it runs:

1. `npm run lint` - ESLint
2. `npm run format` - Prettier
3. `npm run prisma:format` - Prisma schema formatter

**If pre-commit hooks fail, fix the issues before committing.**

## Project Structure

```
src/
├── cross-cutting/          # Shared infrastructure modules
│   ├── auth/              # Authentication guards and strategies
│   ├── db/                # Prisma service and database module
│   ├── health/            # Health check endpoints (Terminus)
│   ├── providers/          # Utilities (uuid, datetime, encryption, ...)
│   └── logging/           # Structured logging utilities
├── features/               # Feature modules (vertical slices)
│   └── <feature>/
│       ├── _shared/        # Domain + infrastructure shared inside the feature
│       └── <use-case>/     # e.g. create-thing/, update-thing/
├── shared/                 # Cross-feature types, errors, response helpers
├── app.module.ts          # Root application module
└── main.ts                # Application entry point

test/
└── app.e2e-spec.ts        # E2E test suite

prisma/
├── schema.prisma          # Database schema definition
└── migrations/            # Database migration files
```

## Writing Tests

### Unit Tests

**Location**: Same directory as the source file, with `.spec.ts` suffix

**Example**: `src/app.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    })
      .overrideGuard(ApiKeyGuard) // Override guards if needed
      .useValue({ canActivate: () => true })
      .compile();
  });

  describe('methodName', () => {
    it('should return expected value', () => {
      const controller = app.get(AppController);
      expect(controller.methodName()).toBe('expected');
    });
  });
});
```

**Best Practices**:

1. Use `beforeAll` for module setup (runs once before all tests)
2. Use `describe` blocks to group related tests
3. Use clear, descriptive test names (`should return expected value`)
4. Override guards/mocks using `.overrideProvider()` or `.overrideGuard()`
5. Test one thing per test

### E2E Tests

**Location**: `test/` directory with `.e2e-spec.ts` suffix

**Example**: `test/app.e2e-spec.ts`

```typescript
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

**Best Practices**:

1. Always clean up with `afterAll` (close the app)
2. Use `supertest` for HTTP assertions
3. Test real HTTP requests, not just functions
4. Test both success and error cases

### Running Tests

**Before committing**:

1. Run unit tests: `npm run test`
2. Run E2E tests: `npm run test:e2e`
3. Check coverage: `npm run test:cov`

**For development**:

- Use `npm run test:watch` for automatic test re-running

## Working with Prisma

### Schema Changes

1. **Edit the schema**: Modify `prisma/schema.prisma`

2. **Generate Prisma Client**:

   ```bash
   npm run prisma:generate
   ```

3. **Create a migration**:

   ```bash
   npm run prisma:migrate
   ```

   This will create a new migration in `prisma/migrations/`

4. **Format the schema**:
   ```bash
   npm run prisma:format
   ```

### Using Prisma Client

The Prisma service is provided globally by `PrismaModule`.
Import `PrismaService` from `src/cross-cutting/db/prismaClient.ts`:

```typescript
import { PrismaService } from './cross-cutting/db/prismaClient';

// In your service
constructor(private prisma: PrismaService) {}

async findAll() {
  return this.prisma.yourModel.findMany();
}
```

### Database Reset

**⚠️ WARNING**: This deletes all data!. Always ask for confirm when running this script.

```bash
npm run prisma:migrate:reset
```

## Creating New Modules

Prefer creating modules inside `src/features/<feature>/...` so code stays feature-scoped.
You may use the NestJS CLI, but generate into the `features/` folder (and then adapt files to our patterns):

```bash
# Example: create a new feature module
nest g module features/your-feature

# Example: create a new endpoint slice inside a feature
nest g module features/your-feature/create-thing
nest g controller features/your-feature/create-thing
```

This automatically updates imports and module declarations.

After generation, refactor to:

- Use `createZodDto` DTOs (not class-validator DTOs)
- Use a `useCase.ts` with a Symbol token (not a generic “service”)
- Put reusable ports/adapters in `features/your-feature/_shared/`

## Cross-Cutting Concerns

### Logging

The project includes a structured logging system in `src/cross-cutting/logging/` using the `LoggerFactory` pattern.

**Import the logger token + types:**

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { ILoggerFactory } from '../cross-cutting/logging/logger.factory';
import { ILogger } from '../cross-cutting/logging/port/logger.port';
```

**Create a logger per service:**

```typescript
@Injectable()
export class YourService {
  private readonly logger: ILogger;

  constructor(
    @Inject(ILoggerFactory)
    private readonly loggerFactory: ILoggerFactory,
  ) {
    this.logger = this.loggerFactory.createLoggerFromClass(YourService);
  }

  yourMethod() {
    this.logger.log('Processing data');
    this.logger.debug('Detailed debug info', { userId: 123 });
    this.logger.warn('Warning message');
    this.logger.error('Error occurred', new Error('Something went wrong'));
  }
}
```

**Or with custom context string:**

```typescript
@Injectable()
export class YourService {
  private readonly logger: ILogger;

  constructor(
    @Inject(ILoggerFactory)
    private readonly loggerFactory: ILoggerFactory,
  ) {
    this.logger = this.loggerFactory.createLogger('YourService');
  }
}
```

**Available log methods:**

- `logger.log(message, ...optionalParams)` - General logging
- `logger.debug(message, ...optionalParams)` - Debug level
- `logger.warn(message, ...optionalParams)` - Warning level
- `logger.error(message, ...optionalParams)` - Error level
- `logger.verbose(message, ...optionalParams)` - Verbose level

### Authentication

The project uses `JeffAuth` decorator for authentication, which simplifies guard usage and automatically adds Swagger documentation.

**Import and use the decorator:**

```typescript
import { Controller, Get } from '@nestjs/common';
import { JeffAuth, AuthType } from '../cross-cutting/auth/jeffAuth';

@Controller('your-resource')
@JeffAuth(AuthType.JWT)
export class YourController {
  @Get()
  findAll() {
    // Protected by JWT authentication
  }
}
```

**Available Auth Types:**

1. **JWT Authentication** (default):

```typescript
import { JeffAuth, AuthType } from '../cross-cutting/auth/jeffAuth';

@Controller('users')
@JeffAuth(AuthType.JWT)
// or simply @JeffAuth() since JWT is default
export class UsersController {}
```

- Uses Bearer token authentication
- Requires `Authorization: Bearer <token>` header
- Automatically adds Swagger API documentation

2. **API Key Authentication**:

```typescript
import { JeffAuth, AuthType } from '../cross-cutting/auth/jeffAuth';

@Controller('api')
@JeffAuth(AuthType.API_KEY)
export class ApiController {}
```

- Uses API key, timestamp, and signature headers
- Requires three headers:
  - `x-api-key`
  - `x-timestamp`
  - `x-signature`
- Suitable for service-to-service authentication

**Use on specific endpoints:**

```typescript
import { JeffAuth, AuthType } from '../cross-cutting/auth/jeffAuth';

@Controller('resources')
export class ResourcesController {
  @Get('public')
  publicEndpoint() {
    // No authentication required
  }

  @Get('protected')
  @JeffAuth(AuthType.JWT)
  protectedEndpoint() {
    // Requires JWT authentication
  }

  @Post('internal')
  @JeffAuth(AuthType.API_KEY)
  internalEndpoint() {
    // Requires API key authentication
  }
}
```

**The decorator automatically:**

- Applies the appropriate guard (`JWTGuard` or `ApiKeyGuard`)
- Adds Swagger documentation (`ApiBearerAuth` or `ApiSecurity`)
- Adds standard error responses (401 Unauthorized, 403 Forbidden)

### Health Checks

Health endpoints are available via `/health` (powered by Terminus). Add custom health indicators in `src/cross-cutting/health/`.

## Common Tasks

### Adding a New Environment Variable

1. Add to `.env.example` (template)
2. Add to `.env` (local development)
3. Access via `@nestjs/config`:

```typescript
import { ConfigService } from '@nestjs/config';

constructor(private config: ConfigService) {}

getDatabaseUrl() {
  return this.config.get('DATABASE_URL');
}
```

### Debugging

1. **Start in debug mode**:

   ```bash
   npm run start:debug
   ```

2. **Debug tests**:

   ```bash
   npm run test:debug
   ```

3. Use VS Code debugger or Chrome DevTools

### Building for Production

1. **Build the application**:

   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm run start:prod
   ```

The build output is in the `dist/` directory.

## Troubleshooting

### Common Issues

**"Cannot find module" errors**:

- Run `npm install` to ensure dependencies are installed
- Run `npm run prisma:generate` if Prisma types are missing

**Prisma client outdated**:

- Run `npm run prisma:generate` after schema changes

**Tests failing locally**:

- Ensure database is running: `docker compose up -d`
- Run migrations: `npm run prisma:migrate`

**Pre-commit hooks failing**:

- Run `npm run lint` and `npm run format` manually to see errors
- Fix issues, then commit again

## Best Practices Summary

1. **Type Safety**: Leverage TypeScript types; avoid `any` unless necessary
2. **Testing**: Write unit tests for services, E2E tests for controllers
3. **Database**: Always create migrations for schema changes; don't edit manually
4. **Code Quality**: Run `npm run lint` and `npm run format` before committing
5. **Environment**: Never commit `.env` files; use `.env.example` as template
6. **Security**: Use guards for protected endpoints; validate inputs
7. **Performance**: Use SWC for faster builds; leverage Prisma's query optimization
8. **Logging**: Use structured logging with context for debugging

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
