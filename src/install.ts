import { execSync } from 'node:child_process';

type InstallParams = {
  targetDir: string;
};

export async function installDependencies({ targetDir }: InstallParams): Promise<void> {
  execSync('npm install', {
    cwd: targetDir,
    stdio: 'inherit',
  });
}
