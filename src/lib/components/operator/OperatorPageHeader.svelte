<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		actions?: Snippet;
	};

	let { title, actions }: Props = $props();
</script>

<header
	class="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-900 z-10"
>
	<h1 class="font-syne text-xl font-bold text-gray-900 dark:text-slate-100">{title}</h1>
	{#if actions}
		<div class="flex items-center gap-3">
			{@render actions()}
		</div>
	{/if}
</header>
