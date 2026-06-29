<script lang="ts">
	import { offlineState } from '$lib/stores/offline.svelte';
	import type { DriverJobDayStats } from '$lib/types/driver-jobs';

	type Props = {
		stats: DriverJobDayStats;
		showSyncDots?: boolean;
	};

	let { stats, showSyncDots = false }: Props = $props();

	const offline = $derived(showSyncDots || !offlineState.online);

	const items = $derived([
		{ key: 'pending', label: `${stats.pending} Pending`, dotClass: 'bg-amber-600' },
		{
			key: 'in_progress',
			label: `${stats.in_progress} In Progress`,
			dotClass: 'bg-blue-600'
		},
		{ key: 'complete', label: `${stats.complete} Complete`, dotClass: 'bg-green-600' }
	] as const);
</script>

<div class="flex gap-2 overflow-x-auto px-5 pb-1">
	{#each items as item (item.key)}
		<div
			class="relative flex h-[30px] shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 dark:border-slate-600 dark:bg-slate-800"
		>
			<span class="size-1.5 rounded-sm {item.dotClass}" aria-hidden="true"></span>
			<span class="font-inter text-xs font-medium text-gray-900 dark:text-slate-100">
				{item.label}
			</span>
			{#if offline}
				<span
					class="absolute -top-px -right-px size-1 rounded-sm bg-amber-600"
					aria-hidden="true"
				></span>
			{/if}
		</div>
	{/each}
</div>
