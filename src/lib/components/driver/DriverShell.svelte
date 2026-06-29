<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import BottomTabBar from '$lib/components/driver/BottomTabBar.svelte';

	type Props = { children: Snippet };

	let { children }: Props = $props();

	const hideTabBar = $derived(
		/^\/jobs\/[^/]+(\/(complete|report-issue(?:\/success)?|started))?$/.test(page.url.pathname) &&
			page.url.pathname !== '/jobs/new'
	);
</script>

<div class="mx-auto flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-white dark:bg-slate-900">
	<main
		class="flex min-h-0 flex-1 flex-col overflow-hidden {hideTabBar ? 'pb-0' : 'pb-[83px]'}"
	>
		{@render children()}
	</main>
	{#if !hideTabBar}
		<BottomTabBar />
	{/if}
</div>
