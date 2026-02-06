# Agent Instructions

This document provides guidelines for AI agents working on this project.

## Project Overview

This is a NestJS-based backend application with:
- **Framework**: NestJS 11.x with TypeScript 5.x
- **Database**: PostgreSQL with Prisma ORM 7.x
- **Testing**: Jest for unit and E2E tests
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks
- **Runtime**: SWC for fast compilation

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
│   └── logging/           # Structured logging utilities
├── middleware/            # NestJS middleware (e.g., context)
├── app.module.ts          # Root application module
├── app.controller.ts      # Root controller
├── app.service.ts         # Root service
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

The Prisma service is available in `src/cross-cutting/db/`. Import it:

```typescript
import { PrismaService } from './cross-cutting/db/prisma.service';

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

Use the NestJS CLI to generate new modules:

```bash
# Generate a module
nest g module modules/your-module

# Generate a controller
nest g controller modules/your-module

# Generate a service
nest g service modules/your-module
```

This automatically updates imports and module declarations.

## Cross-Cutting Concerns

### Logging

The project includes a structured logging system in `src/cross-cutting/logging/` using the `LoggerFactory` pattern.

**Import the LoggerFactory:**

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerFactory } from '../cross-cutting/logging/logger.factory';
import { ILogger } from '../cross-cutting/logging/interface/logger';
```

**Create a logger per service:**

```typescript
@Injectable()
export class YourService {
  private readonly logger: ILogger;

  constructor(loggerFactory: LoggerFactory) {
    // Create logger with class name as context
    this.logger = loggerFactory.createLoggerFromClass(YourService);
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

  constructor(loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.createLogger('YourService');
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
