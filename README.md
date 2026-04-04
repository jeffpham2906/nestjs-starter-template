# create-nest-starter

A publishable `npm create` CLI that scaffolds a NestJS starter project from a template.

This repo contains:

- **CLI package (this repo root)**: `create-nest-starter`
- **Starter template (preserved)**: the actual NestJS project lives in `template/` and is what gets copied into newly generated projects

## Quick Start

### Create a new project (recommended)

From npm (after you publish):

```bash
npm create nest-starter@latest my-app
```

This will run the package named `create-nest-starter`.

You can also run directly via npx:

```bash
npx create-nest-starter@latest my-app
```

### Interactive mode

If you omit flags, the CLI will prompt for any missing values:

- Project name (if missing)
- Database (`postgres` or `mysql`)
- Include Docker files (yes/no)

Example:

```bash
npm create nest-starter@latest
```

## CLI Usage

```bash
create-nest-starter [projectName] [options]
```

Options:

- `--db <postgres|mysql>`: Configure the project for Postgres or MySQL
- `--docker`: Include Docker files (`Dockerfile`, `compose.yaml`)
- `--skip-install`: Skip running `npm install`

Examples:

```bash
# Postgres + Docker + install deps
npm create nest-starter@latest my-app -- --db postgres --docker

# MySQL + no Docker + skip install
npm create nest-starter@latest my-app -- --db mysql --skip-install
```

Note: when using `npm create`, pass CLI flags after `--`.

## Template Source (degit)

The CLI downloads a template using `degit` (no git history) into the target folder.

By default, the CLI uses this repo’s `template/` subdirectory:

- `jeffpham2906/nestjs-starter-template/template`

You can override the template source via env var (format: `owner/repo/subdir`):

```bash
export CREATE_NEST_STARTER_TEMPLATE_REPO="<your-github-username>/<your-repo>/template"
```

Example:

```bash
export CREATE_NEST_STARTER_TEMPLATE_REPO="jeffpham/create-nest-starter/template"
npm create nest-starter@latest my-app
```

Important:

- The GitHub repo used as the template source must be public, or users will get download/auth errors.

### Why `template/` exists

Keeping the starter project in `template/` ensures your **starter’s** `package.json` (scripts, Prisma commands, Nest config, etc.) stays intact and is copied into generated projects, while the repo root stays a clean, publishable CLI package.

## What the CLI customizes

After cloning the template, the CLI:

- Updates the generated project’s `package.json` name to match your project name
- Writes `.env` and `.env.example` based on the selected database
- Removes Docker files if `--docker` is not selected
- Applies a small MySQL adjustment (switches Prisma provider and updates the Prisma module to avoid Postgres-only adapter wiring)

## After generation

```bash
cd my-app
npm run start:dev
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the CLI in dev mode (TypeScript via `tsx`):

```bash
npm run dev -- my-app
```

Build:

```bash
npm run build
```

Smoke test the built output:

```bash
node dist/index.js --help
```

## Publishing

To make this available to everyone as:

```bash
npm create nest-starter@latest my-app
```

you must publish this package to npm under the name `create-nest-starter`.

Steps:

1. Build once locally (optional; publishing also builds via `prepublishOnly`)

```bash
npm run build
```

2. Log in to npm

```bash
npm login
```

3. Pick a version

```bash
npm version patch
```

4. Publish (public)

```bash
npm publish --access public
```

5. Verify

```bash
npm view create-nest-starter version
```

Then users can run:

```bash
npm create nest-starter@latest my-app
```

```bash
npm publish
```

## License

MIT
