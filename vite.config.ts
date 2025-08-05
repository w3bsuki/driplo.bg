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
		}),
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: process.env.SENTRY_ORG,
				project: process.env.SENTRY_PROJECT,
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
		// Enable source maps for better debugging
		sourcemap: true,
		// Report chunk sizes
		chunkSizeWarningLimit: 500,
		rollupOptions: {
			output: {
				// Let Vite handle chunk splitting automatically for now
			}
		}
	},
	// Optimize deps to include fontsource packages
	optimizeDeps: {
		include: [
			'@fontsource/inter',
			'@fontsource/plus-jakarta-sans',
			'@fontsource/jetbrains-mono'
		]
	},
	// Ensure proper asset handling
	assetsInclude: ['**/*.woff', '**/*.woff2']
});
