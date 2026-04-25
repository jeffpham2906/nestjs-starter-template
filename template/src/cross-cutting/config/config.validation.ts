import { z } from 'zod';

export const configSchema = z.object({
  NODE_ENV: z
    .enum(['local', 'development', 'production', 'test'])
    .default('local'),
  PORT: z.string().default('3000'),
  ENCRYPTION_KEY: z.string().min(1, 'ENCRYPTION_KEY is required'),
});

export type Config = z.infer<typeof configSchema>;

export const validateConfig = (config: Record<string, unknown>): Config => {
  return configSchema.parse(config);
};
