<script lang="ts">
	import { page } from '$app/state';
	import { Check } from '@lucide/svelte';
	import DriverJobListCard from '$lib/components/driver/DriverJobListCard.svelte';
	import { offlineState } from '$lib/stores/offline.svelte';
	import type { PendingSyncJob } from '$lib/stores/offline.svelte';
	import type { DriverJobListItem } from '$lib/types/driver-jobs';
	import { syncPreviewPendingJobs } from '$lib/utils/driver-jobs-theme';

	type Props = {
		morningJobs: DriverJobListItem[];
		afternoonJobs: DriverJobListItem[];
		hideCardSync?: boolean;
	};

	let { morningJobs, afternoonJobs, hideCardSync = false }: Props = $props();

	const previewSyncJobs = $derived(
		hideCardSync ? [] : syncPreviewPendingJobs(page.url.searchParams.get('preview'))
	);

	const pendingSyncByJobId = $derived.by(() => {
		const map = new Map<string, { type: PendingSyncJob['type']; showBadge: boolean }>();
		for (const entry of previewSyncJobs) {
			map.set(entry.jobId, { type: entry.type, showBadge: entry.showBadge ?? true });
		}
		if (!hideCardSync) {
			for (const entry of offlineState.pendingSyncJobs) {
				map.set(entry.jobId, { type: entry.type, showBadge: true });
			}
		}
		return map;
	});

	const hasJobs = $derived(morningJobs.length > 0 || afternoonJobs.length > 0);
</script>

<div class="flex flex-col gap-2">
	{#if morningJobs.length > 0}
		<p
			class="font-inter px-5 text-[11px] font-semibold tracking-[0.88px] text-gray-500 uppercase dark:text-slate-400"
		>
			Morning
		</p>
		<div class="flex flex-col gap-2 px-5">
			{#each morningJobs as job (job.id)}
				{@const pending = pendingSyncByJobId.get(job.id)}
				<DriverJobListCard
					{job}
					pendingSync={pending?.type ?? null}
					showSyncBadge={pending?.showBadge ?? true}
				/>
			{/each}
		</div>
	{/if}

	{#if afternoonJobs.length > 0}
		<p
			class="font-inter px-5 text-[11px] font-semibold tracking-[0.88px] text-gray-500 uppercase dark:text-slate-400"
		>
			Afternoon
		</p>
		<div class="flex flex-col gap-2 px-5">
			{#each afternoonJobs as job (job.id)}
				{@const pending = pendingSyncByJobId.get(job.id)}
				<DriverJobListCard
					{job}
					pendingSync={pending?.type ?? null}
					showSyncBadge={pending?.showBadge ?? true}
				/>
			{/each}
		</div>
	{/if}

	{#if hasJobs}
		<div class="flex items-center justify-center gap-1.5 px-5 py-2 pb-4">
			<Check size={14} class="text-gray-500 dark:text-slate-400" stroke-width={2} aria-hidden="true" />
			<p class="font-inter text-xs text-gray-500 dark:text-slate-400">
				That's all your jobs for today
			</p>
		</div>
	{/if}
</div>
