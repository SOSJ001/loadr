<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		/** Fill remaining height; child regions handle their own scroll (e.g. jobs table). */
		fill?: boolean;
		class?: string;
	};

	let { children, fill = false, class: className = '' }: Props = $props();
</script>

<div
	class="flex min-h-0 flex-1 flex-col bg-white px-8 pt-6 pb-6 dark:bg-slate-900 {fill
		? 'overflow-hidden'
		: 'overflow-x-hidden overflow-y-auto'} {className}"
>
	{@render children()}
</div>
