import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    // NODE_ENV=test hace que AppModule lea .env.test y use la base de pruebas.
    env: { NODE_ENV: 'test' },
    // Los archivos comparten una sola base de datos: se ejecutan uno tras otro
    // para que la limpieza de uno no borre los datos que otro esta usando.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
