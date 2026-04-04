/**
 * @filename: lint-staged.config.ts
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.ts': ['npm run lint', 'npm run format', 'npm run prisma:format'],
};
