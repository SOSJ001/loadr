<script lang="ts">
	import { ChevronLeft } from '@lucide/svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	type Props = {
		title: string;
		backHref: string;
		showThemeToggle?: boolean;
	};

	let { title, backHref, showThemeToggle = true }: Props = $props();
</script>

<header class="flex h-[52px] w-full max-w-[390px] items-center px-5">
	<a
		href={backHref}
		class="flex size-11 shrink-0 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-slate-800"
		aria-label="Go back"
	>
		<ChevronLeft size={20} stroke-width={1.75} aria-hidden="true" />
	</a>
	<h1 class="font-syne min-w-0 flex-1 text-center text-base font-bold text-gray-900 dark:text-slate-100">
		{title}
	</h1>
	<div class="flex size-11 shrink-0 items-center justify-end">
		{#if showThemeToggle}
			<ThemeToggle />
		{/if}
	</div>
</header>
