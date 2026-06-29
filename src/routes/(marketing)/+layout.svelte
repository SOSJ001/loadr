<script lang="ts">
	import { onMount } from 'svelte';
	import MarketingFooter from '$lib/components/marketing/MarketingFooter.svelte';
	import MarketingHeader from '$lib/components/marketing/MarketingHeader.svelte';
	import { initTheme } from '$lib/stores/theme.svelte';

	let { children } = $props();

	onMount(() => {
		initTheme();
	});
</script>

<div class="flex min-h-screen flex-col bg-white dark:bg-slate-900">
	<MarketingHeader />
	<main class="flex-1">{@render children()}</main>
	<MarketingFooter />
</div>
