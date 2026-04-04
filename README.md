# NestJS Starter (Fastify + Prisma + Zod)

NestJS 11 starter template focused on a DDD-ish, feature-first architecture with ports/adapters:

- **Runtime**: Fastify (`@nestjs/platform-fastify`)
- **Database**: PostgreSQL via Docker Compose
- **ORM**: Prisma 7 (client generated into `generated/prisma`)
- **Validation**: `nestjs-zod` (global Zod validation pipe + OpenAPI cleanup)
- **Docs**: Swagger UI at `/api-docs`

## Prerequisites

- Node.js `>= 20`
- npm `>= 10`
- Docker + Docker Compose (for local Postgres)

Optional but recommended:

- `nvm` (or similar) to manage Node versions

## Quick start (local)

1) Install dependencies

```bash
npm install
```

2) Configure env

```bash
cp .env.example .env
```

3) Start Postgres

```bash
docker compose up -d
```

4) Run migrations (creates `prisma/migrations` if missing) and generate Prisma client

```bash
npm run prisma:migrate
```

5) Start the API

```bash
npm run start:dev
```

API will be running on `http://localhost:3000` (or your `PORT`).

## Day-to-day workflow

```bash
# run API (watch mode)
npm run start:dev

# lint + format
npm run lint
npm run format

# unit tests + e2e tests
npm run test
npm run test:e2e
```

## Contributing

See `CONTRIBUTING.md` for:

- Local setup (including Postgres + Prisma)
- How this architecture is organized
- A step-by-step checklist for adding a new feature

## API docs (Swagger)

- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs/swagger.json`

Swagger is configured in `src/main.ts`.

## Endpoints

### Health

- `GET /health` — Terminus health check that pings the database connection.

### Specimen Management (example feature)

- `POST /specimen` — creates a specimen (currently uses mocked persistence; repository adapter logs to console).

Example:

```bash
curl -X POST "http://localhost:3000/specimen" \
   -H "content-type: application/json" \
   -d '{"name":"Example"}'
```

## Architecture

This repo follows a practical mix of:

- **Feature-first / vertical slice**: most code lives in `src/features/<feature>/...`.
- **DDD building blocks** (lightweight): entities + value objects + domain errors.
- **Ports & adapters**: use-cases depend on interfaces (“ports”), and infra implementations (“adapters”) live at the edge.

### Dependency direction

The intended direction is “outside → in”:

```mermaid
flowchart LR
   HTTP[Controller] --> UC[Use case]
   UC --> Domain[Domain entities/value objects]
   UC --> Ports[Ports (interfaces)]
   Adapters[Adapters (Prisma/HTTP/etc.)] --> Ports
```

### Cross-cutting vs features

- `src/cross-cutting/` contains reusable infrastructure concerns:
   - auth (`@JeffAuth`, guards)
   - db (Prisma adapter + `PrismaService`)
   - validation (global Zod pipe + exception filters)
   - logging (`ILogger`, `LoggerFactory`)
   - providers (`IUuidProvider`, `IDateTimeProvider`) to keep domain/use-cases testable

- `src/features/` contains business capabilities:
   - Example: `specimen-management`
      - `create-specimen/` is a slice (controller + use-case + DTOs)
      - `_shared/` holds the “feature internals” shared across slices:
         - `domain/` (entities, errors, types)
         - `infrastructure/ports/` (interfaces)
         - `infrastructure/adapters/` (Prisma implementations)
         - `dto/` + `mappers/` for read-model mapping

### Use-cases + Result types

Use-cases (e.g. `CreateSpecimenUseCase`) return `neverthrow` `Result` to make success/failure explicit and keep error mapping close to the edge (controllers).

### Validation + error responses

- Request DTOs are generated from Zod schemas (`createZodDto`).
- A global Zod validation pipe is registered in `ValidationModule`.
- `ZodValidationExceptionFilter` maps validation errors into `{ fieldErrors, formErrors }`.
- `GlobalExceptionFilter` provides a consistent error envelope for uncaught errors.

## Authentication (scaffold)

This repo includes a composable `@JeffAuth()` decorator that wires guards and Swagger security:

- `@JeffAuth()` / `@JeffAuth(AuthType.JWT)`
   - Expects `Authorization: Bearer <token>`
   - Uses `JWTGuard` + `RoleGuard`
- `@JeffAuth(AuthType.API_KEY)`
   - Expects `x-api-key`, `x-timestamp`, `x-signature`
   - Uses `ApiKeyGuard` + `RoleGuard`

The guards are currently placeholders (they log and allow requests) and are meant to be replaced with real validation/authorization logic.

## Prisma notes

- Prisma is configured via `prisma.config.ts` and reads `DATABASE_URL` from `.env`.
- Prisma Client output is configured to `generated/prisma`.
   - In application code, import the generated client types from `generated/prisma/client` (not `@prisma/client`).

Common commands:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run prisma:migrate:reset
npm run prisma:format
```

`npm run prisma:seed` is wired in `package.json`, but requires a `prisma/seed.ts` implementation.

## Troubleshooting

- Postgres isn’t running: `docker compose up -d`
- Prisma can’t connect: check `DATABASE_URL` in `.env` matches the port exposed by `compose.yaml`
- Prisma types missing: run `npm run prisma:generate`
- Lint/format failures on commit: Husky runs lint-staged; run `npm run lint` and `npm run format` locally

## Scripts

### App

```bash
npm run start:dev
npm run start:debug
npm run build
npm run start:prod
```

### Quality

```bash
npm run lint
npm run format
```

### Tests

```bash
npm run test
npm run test:e2e
```

## Project structure

```
.
├── compose.yaml
├── prisma/
│   └── schema.prisma
├── generated/
│   └── prisma/              # generated Prisma Client output
├── src/
│   ├── app.module.ts        # app wiring (cross-cutting + features)
│   ├── main.ts              # bootstrap + Swagger
│   ├── cross-cutting/
│   │   ├── auth/            # guards + @JeffAuth decorator
│   │   ├── config/          # env validation (Zod)
│   │   ├── db/              # Prisma adapter + PrismaService
│   │   ├── health/          # /health
│   │   ├── logging/         # ILogger + factory
│   │   ├── providers/       # uuid/datetime providers
│   │   └── validation/      # global Zod pipe + exception filters
│   ├── features/
│   │   └── specimen-management/
│   │       ├── _shared/     # domain + ports + adapters
│   │       └── create-specimen/
│   └── shared/              # shared types/errors/value-objects
└── test/
      └── app.e2e-spec.ts
```

## Environment variables

See `.env.example`.

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`
- `DATABASE_URL`
- `PORT`
- `NODE_ENV` (validated values: `local | development | production | test`)
