export default {
	plugins: {
		'@tailwindcss/postcss': {},
		autoprefixer: {},
		// Production optimization
		...(process.env.NODE_ENV === 'production' && {
			cssnano: {
				preset: ['default', {
					discardComments: { removeAll: true },
					normalizeWhitespace: true,
					reduceIdents: false, // Keep CSS custom property names
					zindex: false, // Don't optimize z-index values
				}]
			}
		})
	}
};

