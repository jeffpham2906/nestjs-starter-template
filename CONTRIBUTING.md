# Contributing

Thanks for contributing! This repo is intended to be easy to extend while keeping boundaries clear (feature-first + DDD-ish building blocks + ports/adapters).

## Local setup

Prereqs:

- Node.js >= 20
- npm >= 10
- Docker + Docker Compose

Steps:

```bash
npm install
cp .env.example .env

docker compose up -d
npm run prisma:migrate

npm run start:dev
```

Useful URLs:

- API: http://localhost:3000
- Swagger: http://localhost:3000/api-docs

## Common scripts

```bash
# lint + format
npm run lint
npm run format

# unit tests + e2e tests
npm run test
npm run test:e2e

# prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:reset
```

Git hooks:

- Pre-commit runs `lint-staged` (lint + format + prisma format).
- Pre-push runs `npm run test`.

If a hook fails, run the same commands locally, fix, and retry.

## Architecture overview (how to navigate the code)

At a high level:

- `src/cross-cutting/` contains reusable infrastructure concerns (logging, validation, auth scaffolding, db access, providers).
- `src/features/` contains business features. Each feature can contain multiple “vertical slices” (endpoint + use-case) and a `_shared/` folder for shared domain/infrastructure within that feature.

### Vertical slice structure

A typical slice looks like:

- `controller.ts` — HTTP boundary (maps transport → command, maps Result → HTTP)
- `request.dto.ts` — Zod-based input DTO (validated by a global Zod pipe)
- `useCase.ts` — application logic (orchestrates domain + ports)
- `response.dto.ts` — Zod-based output shape (used for Swagger + response typing)

### Ports & adapters

Use-cases should depend on **ports** (interfaces / injection tokens), not concrete infrastructure.

Typical locations:

- Ports: `src/features/<feature>/_shared/infrastructure/ports/`
- Adapters: `src/features/<feature>/_shared/infrastructure/adapters/`

Ports are registered using Nest providers (often via `Symbol(...)` tokens), and adapters implement the port.

### Domain building blocks

Domain code lives under `src/features/<feature>/_shared/domain/`:

- Entities (e.g., `Specimen`)
- Factories (centralize creation + validation)
- Domain errors (extend `DomainError`)
- Domain types (Zod schemas + inferred types)

Cross-cutting “shared” utilities live under `src/shared/`:

- `ValidationError` (wraps Zod errors into `{ fieldErrors, formErrors }`)
- Branded types (e.g., `UserId`, `SpecimenId`)
- Value objects (e.g., `AuditInfo`)

### Error handling & validation

- Request validation: DTOs are Zod schemas via `nestjs-zod` + a global `ZodValidationPipe`.
- Validation failures: `ZodValidationExceptionFilter` returns `400` with `fieldErrors` / `formErrors`.
- Unhandled errors: `GlobalExceptionFilter` returns a consistent error envelope.

### Result-based use-cases

Use-cases return `neverthrow` `Result` so success/failure is explicit.

A common pattern is:

- Use-case validates the command (Zod) and returns `err(ValidationError)` on invalid input.
- Controller maps `ValidationError` to `400` and unexpected errors to `500`.

## How to add a new feature (checklist)

1) Create a new feature folder

- `src/features/<feature-name>/`

2) Add a vertical slice

- `src/features/<feature-name>/<slice-name>/controller.ts`
- `src/features/<feature-name>/<slice-name>/useCase.ts`
- `src/features/<feature-name>/<slice-name>/request.dto.ts`
- `src/features/<feature-name>/<slice-name>/response.dto.ts`
- `src/features/<feature-name>/<slice-name>/module.ts`

3) Add feature module wiring

- Add/extend `src/features/<feature-name>/<feature-name>.module.ts`
- Import your slice module(s) there

4) If you need infrastructure

- Define a port in `src/features/<feature-name>/_shared/infrastructure/ports/`
- Implement an adapter in `src/features/<feature-name>/_shared/infrastructure/adapters/`
- Register providers in `src/features/<feature-name>/_shared/module.ts`

5) Register the feature in the app

- Import the feature module into `src/app.module.ts`

6) Document the endpoint

- Add `@ZodResponse(...)` annotations to controllers for accurate Swagger.

## Prisma guidance

- Prisma schema: `prisma/schema.prisma`
- Prisma config: `prisma.config.ts` (uses `DATABASE_URL`)
- Generated client output: `generated/prisma/`

Do not edit generated files by hand. After schema changes, run:

```bash
npm run prisma:migrate
npm run prisma:generate
```

## Auth scaffolding

Auth is intentionally scaffold-only:

- `@JeffAuth()` wires guards + Swagger security.
- Guards currently allow requests and are meant to be replaced with real validation.

If you add auth requirements to an endpoint, document the expected headers in README and verify Swagger reflects them.
