<script lang="ts">
	import { onMount } from 'svelte';
	import { initOfflineSync } from '$lib/offline/init';
	import { registerDriverPwa } from '$lib/pwa/register';
	import { initPwaInstallPrompt } from '$lib/utils/pwa-install.svelte';

	onMount(() => {
		registerDriverPwa();
		const cleanupOffline = initOfflineSync();
		const cleanupInstall = initPwaInstallPrompt();

		return () => {
			cleanupOffline();
			cleanupInstall();
		};
	});
</script>
