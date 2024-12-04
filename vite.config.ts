import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [sveltekit()],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	resolve: {
		alias: {
			$images: resolve('./static/images/')
		}
	}
	//
	// server: {
	// 	proxy: {
	// 		'/api': {
	// 			target: 'http://xjtu.app',
	// 			changeOrigin: true,
	// 			rewrite: (path) => path.replace(/^\/api/, ''),
	// 		},
	// 	},
	// },
})