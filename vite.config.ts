import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
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
				'icons/icon-512-maskable.svg',
				'icons/chrome.svg',
				'icons/chrome.png',
				'icons/chrome@2x.png'
			],
			manifest: {
				id: '/login/driver',
				name: 'Loadr Driver',
				short_name: 'Loadr',
				description: 'Loadr driver app for delivery jobs and proof of capture',
				// Must return 200 without auth — /jobs redirects to login and blocks installability.
				start_url: '/login/driver',
				scope: '/',
				display: 'standalone',
				display_override: ['standalone', 'browser'],
				prefer_related_applications: false,
				background_color: '#0f172a',
				theme_color: '#0f172a',
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
				// Dev has no build output in dev-dist yet — empty precache avoids workbox warnings.
				globPatterns:
					mode === 'development'
						? []
						: ['**/*.{js,css,html,ico,png,svg,webp,woff2,webmanifest}'],
				navigateFallback: null,
				// Required in dev when precache manifest is empty (no build output yet).
				runtimeCaching: [
					{
						urlPattern: /\/api\/v1\/.*/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'loadr-api-v1',
							networkTimeoutSeconds: 10,
							expiration: {
								maxEntries: 64,
								maxAgeSeconds: 60 * 60 * 24
							}
						}
					},
					{
						urlPattern: /\/icons\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'loadr-icons',
							expiration: {
								maxEntries: 32,
								maxAgeSeconds: 60 * 60 * 24 * 30
							}
						}
					}
				]
			},
			devOptions: {
				enabled: true,
				type: 'module'
			}
		})
	],
	ssr: {
		// Bundle Solana for Vercel — externalizing breaks rpc-websockets (CommonClient undefined).
		noExternal: ['@lucide/svelte', '@solana/web3.js', 'bs58', 'rpc-websockets', 'jayson']
	},
	server: {
		allowedHosts: []
	}
}));
