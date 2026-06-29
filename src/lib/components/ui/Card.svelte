<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title?: string;
		class?: string;
		children: Snippet;
	};

	let { title, class: className = '', children }: Props = $props();
</script>

<section class="rounded-lg border bg-white p-4 shadow-sm {className}">
	{#if title}<h2 class="mb-3 text-lg font-semibold">{title}</h2>{/if}
	{@render children()}
</section>
