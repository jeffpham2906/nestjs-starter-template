#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'node:path';
import fs from 'node:fs/promises';

import { promptForMissingOptions } from './prompts.js';
import { downloadTemplate } from './download.js';
import { customizeTemplate } from './customize.js';
import { installDependencies } from './install.js';

type DbChoice = 'postgres' | 'mysql';

type CliOptions = {
  projectName: string;
  db: DbChoice;
  docker: boolean;
  skipInstall: boolean;
};

const DEFAULT_TEMPLATE_REPO =
  process.env.CREATE_NEST_STARTER_TEMPLATE_REPO ??
  'your-github-username/create-nest-starter/template';

async function isNonEmptyDirectory(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) return false;
    const entries = await fs.readdir(dirPath);
    return entries.length > 0;
  } catch {
    return false;
  }
}

async function ensureTargetDirectoryIsUsable(targetDir: string): Promise<void> {
  const existsAndNonEmpty = await isNonEmptyDirectory(targetDir);
  if (existsAndNonEmpty) {
    throw new Error(
      `Target directory already exists and is not empty: ${targetDir}`,
    );
  }
}

function parseDbChoice(value: unknown): DbChoice | undefined {
  if (typeof value !== 'string') return undefined;
  if (value === 'postgres' || value === 'mysql') return value;
  return undefined;
}

async function main(): Promise<void> {
  const program = new Command()
    .name('create-nest-starter')
    .description('Scaffold a NestJS starter project')
    .argument('[projectName]', 'Project directory name')
    .option('--db <postgres|mysql>', 'Database to configure')
    .option('--docker', 'Include Docker files')
    .option('--skip-install', 'Skip installing dependencies')
    .parse(process.argv);

  const [projectNameArg] = program.args as Array<string | undefined>;
  const opts = program.opts<{
    db?: string;
    docker?: boolean;
    skipInstall?: boolean;
  }>();

  const dockerFlagProvided = process.argv.includes('--docker');

  const partial: Partial<CliOptions> = {
    projectName: projectNameArg,
    db: parseDbChoice(opts.db),
    docker: dockerFlagProvided ? true : undefined,
    skipInstall: Boolean(opts.skipInstall),
  };

  const options = await promptForMissingOptions(partial);

  const targetDir = path.resolve(process.cwd(), options.projectName);
  await ensureTargetDirectoryIsUsable(targetDir);

  const downloadSpinner = ora('Downloading template...').start();
  try {
    await downloadTemplate({
      templateRepo: DEFAULT_TEMPLATE_REPO,
      targetDir,
    });
    downloadSpinner.succeed('Template downloaded');
  } catch (error) {
    downloadSpinner.fail('Failed to download template');
    throw error;
  }

  const customizeSpinner = ora('Customizing project...').start();
  try {
    await customizeTemplate({
      targetDir,
      projectName: options.projectName,
      db: options.db,
      docker: options.docker,
    });
    customizeSpinner.succeed('Project customized');
  } catch (error) {
    customizeSpinner.fail('Failed to customize project');
    throw error;
  }

  if (!options.skipInstall) {
    const installSpinner = ora('Installing dependencies (npm install)...').start();
    try {
      await installDependencies({ targetDir });
      installSpinner.succeed('Dependencies installed');
    } catch (error) {
      installSpinner.fail('Failed to install dependencies');
      throw error;
    }
  }

  console.log();
  console.log(chalk.green('Success!'));
  console.log();
  console.log('Next steps:');
  console.log(chalk.cyan(`  cd ${options.projectName}`));
  console.log(chalk.cyan('  npm run start:dev'));
  console.log();

  if (DEFAULT_TEMPLATE_REPO.includes('your-github-username')) {
    console.log(
      chalk.yellow(
        'Note: Set CREATE_NEST_STARTER_TEMPLATE_REPO to your real template repo (e.g. username/repo/template).',
      ),
    );
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(chalk.red(`Error: ${message}`));
  process.exitCode = 1;
});
