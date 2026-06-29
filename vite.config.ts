import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			scope: '/',
			filename: 'sw.js',
			includeAssets: [
				'icons/icon-192.png',
				'icons/icon-512.png',
				'icons/icon-512-maskable.png',
				'icons/apple-touch-icon.png',
				'icons/icon-512.svg',
				'icons/icon-512-maskable.svg'
			],
			manifest: {
				id: '/',
				name: 'Loadr Driver',
				short_name: 'Loadr',
				description: 'Loadr driver app for delivery jobs and proof of capture',
				// Must return 200 without auth — /jobs redirects to login and blocks installability.
				start_url: '/login/driver',
				scope: '/',
				display: 'standalone',
				background_color: '#f9fafb',
				theme_color: '#111827',
				icons: [
					{
						src: '/icons/icon-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/icons/apple-touch-icon.png',
						sizes: '180x180',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/icons/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/icons/icon-512-maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,webmanifest}'],
				navigateFallback: null
			},
			devOptions: {
				enabled: true,
				type: 'module'
			}
		})
	],
	ssr: {
		noExternal: ['@lucide/svelte']
	},
	server: {
		allowedHosts: []
	}
});
