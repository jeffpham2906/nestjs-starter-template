import fs from 'node:fs/promises';
import path from 'node:path';

type DbChoice = 'postgres' | 'mysql';

type CustomizeParams = {
  targetDir: string;
  projectName: string;
  db: DbChoice;
  docker: boolean;
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  const raw = JSON.stringify(value, null, 2) + '\n';
  await fs.writeFile(filePath, raw, 'utf8');
}

function postgresEnvContents(): string {
  return [
    '# Database Configuration',
    'POSTGRES_USER=postgres',
    'POSTGRES_PASSWORD=postgres',
    'POSTGRES_DB=media_service',
    'POSTGRES_PORT=5432',
    '',
    '# Prisma Database URL',
    'DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"',
    '',
    '# Application Configuration',
    'NODE_ENV=development',
    'PORT=3000',
    '',
  ].join('\n');
}

function mysqlEnvContents(): string {
  return [
    '# Database Configuration',
    'MYSQL_USER=mysql',
    'MYSQL_PASSWORD=mysql',
    'MYSQL_DATABASE=app',
    'MYSQL_PORT=3306',
    '',
    '# Prisma Database URL',
    'DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@localhost:${MYSQL_PORT}/${MYSQL_DATABASE}"',
    '',
    '# Application Configuration',
    'NODE_ENV=development',
    'PORT=3000',
    '',
  ].join('\n');
}

function mysqlComposeYaml(): string {
  return [
    'services:',
    '  mysql:',
    '    image: mysql:8.4',
    '    container_name: nest-starter-mysql',
    '    restart: unless-stopped',
    '    environment:',
    '      MYSQL_USER: ${MYSQL_USER:-mysql}',
    '      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-mysql}',
    '      MYSQL_DATABASE: ${MYSQL_DATABASE:-app}',
    '      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root}',
    '    ports:',
    '      - "${MYSQL_PORT:-3306}:3306"',
    '    volumes:',
    '      - mysql_data:/var/lib/mysql',
    '    healthcheck:',
    '      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-uroot", "-p${MYSQL_ROOT_PASSWORD:-root}"]',
    '      interval: 10s',
    '      timeout: 5s',
    '      retries: 10',
    '',
    'volumes:',
    '  mysql_data:',
    '    driver: local',
    '',
  ].join('\n');
}

async function updateProjectPackageName(
  targetDir: string,
  projectName: string,
  db: DbChoice,
): Promise<void> {
  const packageJsonPath = path.join(targetDir, 'package.json');
  const pkg = await readJson<Record<string, unknown>>(packageJsonPath);

  pkg.name = projectName;

  if (db === 'mysql') {
    const deps = (pkg.dependencies ?? {}) as Record<string, string>;
    if ('@prisma/adapter-pg' in deps) {
      delete deps['@prisma/adapter-pg'];
      pkg.dependencies = deps;
    }
  }

  await writeJson(packageJsonPath, pkg);
}

async function writeEnvFiles(targetDir: string, db: DbChoice): Promise<void> {
  const envPath = path.join(targetDir, '.env');
  const envExamplePath = path.join(targetDir, '.env.example');

  const contents = db === 'mysql' ? mysqlEnvContents() : postgresEnvContents();

  await fs.writeFile(envPath, contents, 'utf8');
  await fs.writeFile(envExamplePath, contents, 'utf8');
}

async function applyMysqlPrismaChanges(targetDir: string): Promise<void> {
  const schemaPath = path.join(targetDir, 'prisma', 'schema.prisma');
  if (await fileExists(schemaPath)) {
    const raw = await fs.readFile(schemaPath, 'utf8');
    const updated = raw.replace(
      /provider\s*=\s*"postgresql"/g,
      'provider = "mysql"',
    );
    await fs.writeFile(schemaPath, updated, 'utf8');
  }

  const prismaModulePath = path.join(
    targetDir,
    'src',
    'cross-cutting',
    'db',
    'prisma.module.ts',
  );
  if (await fileExists(prismaModulePath)) {
    const minimalModule = [
      "import { Global, Module } from '@nestjs/common';",
      "import { PrismaService } from './prismaClient';",
      '',
      '@Global()',
      '@Module({',
      '  providers: [PrismaService],',
      '  exports: [PrismaService],',
      '})',
      'export class PrismaModule {}',
      '',
    ].join('\n');

    await fs.writeFile(prismaModulePath, minimalModule, 'utf8');
  }

  const composePath = path.join(targetDir, 'compose.yaml');
  if (await fileExists(composePath)) {
    await fs.writeFile(composePath, mysqlComposeYaml(), 'utf8');
  }
}

async function maybeRemoveDockerFiles(targetDir: string): Promise<void> {
  const toRemove = ['Dockerfile', 'compose.yaml'];
  await Promise.all(
    toRemove.map(async (filename) => {
      const p = path.join(targetDir, filename);
      try {
        await fs.rm(p, { force: true });
      } catch {
        // ignore
      }
    }),
  );
}

export async function customizeTemplate({
  targetDir,
  projectName,
  db,
  docker,
}: CustomizeParams): Promise<void> {
  await updateProjectPackageName(targetDir, projectName, db);
  await writeEnvFiles(targetDir, db);

  if (db === 'mysql') {
    await applyMysqlPrismaChanges(targetDir);
  }

  if (!docker) {
    await maybeRemoveDockerFiles(targetDir);
  }
}
