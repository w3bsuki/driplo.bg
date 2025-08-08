import { paraglideVitePlugin } from "@inlang/paraglide-js"
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentrySvelteKit } from '@sentry/sveltekit';

export default defineConfig({
	plugins: [
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/lib/paraglide",
			strategy: ["url", "cookie", "globalVariable", "baseLocale"],
		}),
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: process.env['SENTRY_ORG'],
				project: process.env['SENTRY_PROJECT'],
			},
		}),
		sveltekit(),
		// Bundle analyzer - generates stats.html after build
		visualizer({
			emitFile: true,
			filename: 'stats.html',
			open: false,
			gzipSize: true,
			brotliSize: true,
			template: 'treemap' // options: 'treemap', 'sunburst', 'network'
		})
	],
	server: {
		port: 5191,
		strictPort: false,
		hmr: {
			overlay: false
		}
	},
	build: {
		// Enable source maps for production debugging
		sourcemap: true,
		// Stricter chunk size warning
		chunkSizeWarningLimit: 300,
		rollupOptions: {
			output: {
				// Aggressive code splitting
				manualChunks: (id) => {
					// Vendor chunks
					if (id.includes('node_modules')) {
						if (id.includes('@supabase/')) return 'supabase';
						if (id.includes('@stripe/') || id.includes('stripe')) return 'stripe';
						if (id.includes('bits-ui')) return 'ui';
						if (id.includes('lucide-svelte')) return 'icons';
						if (id.includes('@tanstack/')) return 'query';
						// NOTE: Avoid isolating validation/zod into its own SSR chunk to prevent circular init
						return 'vendor';
					}
					
					// App chunks by route/feature
					if (id.includes('/routes/(app)/browse/')) return 'browse';
					if (id.includes('/routes/(app)/listings/')) return 'listings';
					if (id.includes('/routes/(app)/checkout/') || id.includes('checkout')) return 'checkout';
					if (id.includes('/routes/(app)/admin/') || id.includes('/routes/dashboard/')) return 'admin';
					if (id.includes('/routes/(app)/brands/')) return 'brands';
					if (id.includes('/routes/(app)/messages/')) return 'messages';
					if (id.includes('/routes/(app)/sell/') || id.includes('create-listing')) return 'sell';
					
					// Default chunk for anything else
					return undefined;
				},
				// Let SvelteKit handle the file naming
			}
		},
		// CSS code splitting
		cssCodeSplit: true,
		// Minification settings
		minify: 'esbuild',
		target: ['es2022', 'chrome64', 'firefox78', 'safari12']
	},
	// Optimize deps for better tree shaking and bundling
	optimizeDeps: {
		include: [
			// Pre-bundle heavy dependencies for better performance
			'@supabase/supabase-js',
			'@stripe/stripe-js',
			'date-fns',
			'zod',
			'lucide-svelte'
		],
		exclude: [
			// Exclude dev-only and unused packages
			'@testing-library/svelte',
			'vitest',
			'@fontsource/inter',
			'@fontsource/plus-jakarta-sans',
			'@fontsource/jetbrains-mono'
		]
	},
	// Define which modules should be treated as external
	ssr: {
		// Don't externalize these for better optimization
		noExternal: ['bits-ui', 'lucide-svelte']
	},
	// Ensure proper asset handling
	assetsInclude: ['**/*.woff', '**/*.woff2']
});
