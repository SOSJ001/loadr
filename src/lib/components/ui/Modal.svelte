<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		title: string;
		children: Snippet;
	};

	let { open = $bindable(false), title, children }: Props = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
		<div class="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
			<div class="mb-3 flex items-center justify-between">
				<h2 class="text-lg font-semibold">{title}</h2>
				<button type="button" class="text-sm text-gray-500" onclick={() => (open = false)}>Close</button>
			</div>
			{@render children()}
		</div>
	</div>
{/if}
