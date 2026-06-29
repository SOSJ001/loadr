<script lang="ts">
	import { Loader2, Wifi } from '@lucide/svelte';

	type Props = {
		visible?: boolean;
	};

	let { visible = false }: Props = $props();
</script>

{#if visible}
	<div
		class="flex h-12 shrink-0 items-center justify-between bg-green-600 px-4"
		role="status"
		aria-live="polite"
	>
		<div class="flex min-w-0 flex-1 items-center gap-2">
			<Wifi size={16} class="shrink-0 text-white" stroke-width={2} aria-hidden="true" />
			<p class="font-inter min-w-0 truncate text-[13px] text-white">
				<span class="font-bold">Back online</span>
				<span class="font-normal opacity-80"> · syncing your updates...</span>
			</p>
		</div>
		<Loader2 size={16} class="shrink-0 animate-spin text-white" stroke-width={2} aria-hidden="true" />
	</div>
{/if}
