# create-nest-starter

Scaffold a NestJS starter project from a template using `npm create`.

This repository contains:

- **The CLI (repo root)**: the publishable `create-nest-starter` package
- **A preserved starter project**: the NestJS starter lives in `template/` (a maintained copy of the starter; the CLI downloads a GitHub template by default)

## Requirements

- Node.js >= 20
- npm >= 10

## Quick start

Create a new project:

```bash
npm create nest-starter@latest my-app
```

Or run via npx:

```bash
npx create-nest-starter@latest my-app
```

After generation:

```bash
cd my-app
npm run start:dev
```

## How the CLI works

- Downloads the template (via `degit`, no git history) into the target folder
- Customizes a few files based on your choices (database, Docker)
- Runs `npm install` unless you opt out

If the target directory already exists and is not empty, the CLI will exit with an error.

## Usage

```bash
create-nest-starter [projectName] [options]
```

When using `npm create`, pass CLI flags after `--`:

```bash
npm create nest-starter@latest my-app -- --db postgres --docker
```

### Interactive mode

Any missing values will be prompted for:

- Project name (if omitted or invalid)
- Database (`postgres` or `mysql`)
- Include Docker files? (default: yes)

Example:

```bash
npm create nest-starter@latest
```

### Options

- `--db <postgres|mysql>`: Database to configure
- `--docker`: Include Docker files (`Dockerfile`, `compose.yaml`)
- `--skip-install`: Skip running `npm install`

Notes:

- To run completely non-interactive, provide `projectName`, `--db ...`, and `--docker` (otherwise you’ll be prompted).
- There is currently no `--no-docker` flag. If you want _no Docker files_, run interactively and answer “no” to the Docker prompt.

## Examples

```bash
# Postgres + Docker + install deps
npm create nest-starter@latest my-app -- --db postgres --docker

# MySQL + Docker + skip install
npm create nest-starter@latest my-app -- --db mysql --docker --skip-install
```

## Template source

By default, the CLI downloads this template:

- `jeffpham2906/nestjs-starter-template/template`

Override the template repo via env var (format: `owner/repo/subdir`):

```bash
export CREATE_NEST_STARTER_TEMPLATE_REPO="<owner>/<repo>/template"
```

Example:

```bash
export CREATE_NEST_STARTER_TEMPLATE_REPO="jeffpham/create-nest-starter/template"
npm create nest-starter@latest my-app
```

Important:

- The template repository must be public (otherwise `degit` will fail to download).

## What gets customized

After download, the CLI updates the generated project:

- Sets `package.json` `name` to your project name
- Writes `.env` and `.env.example` for the chosen database
- If Docker is not included, removes `Dockerfile` and `compose.yaml`

If you choose MySQL, it also makes a few MySQL-specific adjustments (when the files exist in the template):

- Switches Prisma provider in `prisma/schema.prisma` from Postgres to MySQL
- Rewrites `src/cross-cutting/db/prisma.module.ts` to a minimal Prisma module
- Replaces `compose.yaml` with a MySQL service definition

## Local development (for contributors)

Install dependencies:

```bash
npm install
```

Run the CLI in dev mode (TypeScript via `tsx`):

```bash
npm run dev -- my-app --db postgres --docker
```

Build:

```bash
npm run build
```

Smoke test the built CLI:

```bash
node dist/index.js --help
```

## Publishing

To make this available as:

```bash
npm create nest-starter@latest my-app
```

publish this package to npm under the name `create-nest-starter`:

```bash
npm login
npm version patch
npm publish --access public
```

Verify:

```bash
npm view create-nest-starter version
```

## License

MIT
