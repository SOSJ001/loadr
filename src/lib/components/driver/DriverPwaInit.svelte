<script lang="ts">
	import { onMount } from 'svelte';
	import { initOfflineSync } from '$lib/offline/init';

	onMount(() => {
		const cleanupOffline = initOfflineSync();
		return cleanupOffline;
	});
</script>
