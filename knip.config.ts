import type { KnipConfig } from 'knip';

export default {
  entry: [
    'src/app.html',
    'src/hooks.server.ts',
    'src/hooks.client.ts', 
    'src/service-worker.ts',
    'src/routes/**/+*.{js,ts,svelte}',
    'src/routes/**/*.svelte',
    'src/lib/server/index.ts',
    'src/lib/paraglide/*.js',
    'vite.config.ts',
    'svelte.config.js',
    'tailwind.config.js',
    'playwright.config.ts',
    'vitest.config.ts'
  ],
  project: [
    'src/**/*.{js,ts,svelte}',
    'tests/**/*.{js,ts}',
    'scripts/**/*.js',
    '*.{js,ts}'
  ],
  ignore: [
    // Build outputs
    '.svelte-kit/**',
    'build/**',
    'dist/**',
    'static/**',
    
    // Generated files  
    'src/lib/database.types.ts',
    'src/lib/paraglide/**',
    
    // Archive directories
    'docs/archive/**',
    'src/lib/archive/**',
    
    // Test files that might have unused exports
    'tests/setup.ts',
    
    // Scripts
    'scripts/**',
    
    // Config files
    '*.config.*'
  ],
  ignoreDependencies: [
    // Runtime dependencies that might not be explicitly imported
    'dotenv',
    'sharp',
    
    // Build-only dependencies
    'autoprefixer',
    'cssnano',
    'postcss',
    
    // Font packages loaded via CSS
    '@fontsource/inter',
    '@fontsource/jetbrains-mono', 
    '@fontsource/plus-jakarta-sans',
    
    // Dev tools
    'vite-bundle-visualizer',
    'rollup-plugin-visualizer'
  ],
  eslint: {
    config: ['eslint.config.js']
  }
} satisfies KnipConfig;