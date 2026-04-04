type DownloadTemplateParams = {
  templateRepo: string;
  targetDir: string;
};

type DegitEmitter = {
  clone: (dest: string) => Promise<void>;
};

type DegitFactory = (
  repo: string,
  opts?: {
    cache?: boolean;
    force?: boolean;
    verbose?: boolean;
  },
) => DegitEmitter;

export async function downloadTemplate({
  templateRepo,
  targetDir,
}: DownloadTemplateParams): Promise<void> {
  const mod = (await import('degit')) as unknown as { default: DegitFactory };
  const degit = mod.default;

  const emitter = degit(templateRepo, {
    cache: false,
    force: true,
    verbose: false,
  });

  await emitter.clone(targetDir);
}
