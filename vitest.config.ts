import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/*',
        '.svelte-kit/',
        'src/lib/paraglide/',
        'src/lib/database.types.ts',
        'src/routes/**/+*.ts',
        'src/app.d.ts',
        'src/hooks.*.ts'
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 75,
          functions: 80,
          lines: 80
        },
        // Higher thresholds for critical utilities
        'src/lib/utils/': {
          statements: 90,
          branches: 85,
          functions: 90,
          lines: 90
        },
        'src/lib/server/api-utils.ts': {
          statements: 95,
          branches: 90,
          functions: 95,
          lines: 95
        }
      }
    },
    reporters: ['verbose', 'junit'],
    outputFile: {
      junit: './test-results/junit.xml'
    }
  }
});