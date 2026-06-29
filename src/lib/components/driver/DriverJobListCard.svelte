<script lang="ts">
	import { Car, CircleCheck, Clock, FileText, RefreshCw, Truck } from '@lucide/svelte';
	import type { DriverJobListItem } from '$lib/types/driver-jobs';
	import type { JobStatus } from '$lib/types/job';
	import type { PendingSyncJob } from '$lib/stores/offline.svelte';
	import { formatJobTime } from '$lib/utils/driver-jobs';

	type Props = {
		job: DriverJobListItem;
		pendingSync?: PendingSyncJob['type'] | null;
		showSyncBadge?: boolean;
	};

	let { job, pendingSync = null, showSyncBadge = true }: Props = $props();

	const isPendingSync = $derived(pendingSync !== null);
	const showCardSyncBadge = $derived(isPendingSync && showSyncBadge);

	const displayStatus = $derived.by((): JobStatus => {
		if (!pendingSync) return job.status as JobStatus;
		switch (pendingSync) {
			case 'start_job':
				return 'in_progress';
			case 'complete_job':
				return 'complete';
			case 'report_issue':
				return 'attempted';
		}
	});

	const statusStyles: Record<JobStatus, { badge: string; label: string }> = {
		pending: {
			badge: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
			label: 'Pending'
		},
		in_progress: {
			badge: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
			label: 'In Progress'
		},
		complete: {
			badge: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-300',
			label: 'Complete'
		},
		attempted: {
			badge: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
			label: 'Attempted'
		}
	};

	const status = $derived(statusStyles[displayStatus] ?? statusStyles.pending);
	const VehicleIcon = $derived(job.vehicle_label?.toLowerCase() === 'car' ? Car : Truck);
</script>

<div class="relative w-full">
	<div
		class="flex w-full flex-col gap-2.5 rounded-[14px] bg-gray-50 p-4 dark:bg-slate-800 {isPendingSync
			? 'border-[1.5px] border-amber-600 border-l-[3px]'
			: 'border border-gray-200 dark:border-slate-600'}"
	>
		<a
			href="/jobs/{job.id}"
			class="flex flex-col gap-2.5 transition-colors hover:opacity-90"
		>
			<div class="flex items-center justify-between gap-3">
				<p
					class="font-['DM_Mono',ui-monospace,monospace] text-[13px] text-gray-500 dark:text-slate-400"
				>
					{job.reference}
				</p>
				<span
					class="font-inter flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold {status.badge}"
				>
					{#if showCardSyncBadge && displayStatus === 'complete'}
						<RefreshCw size={10} stroke-width={2.5} aria-hidden="true" />
					{/if}
					{status.label}
				</span>
			</div>

			<div class="flex gap-2.5">
				<div class="flex flex-col items-center gap-1 pt-1" aria-hidden="true">
					<div class="size-2 rounded-sm bg-green-600"></div>
					<div class="h-4 w-px border-l border-dashed border-gray-300 dark:border-slate-600"></div>
					<div class="size-2 rounded-sm bg-red-600"></div>
				</div>
				<div class="font-inter flex min-w-0 flex-col gap-2 text-sm text-gray-900 dark:text-slate-100">
					<p class="font-semibold">{job.pickup_address}</p>
					<p>{job.dropoff_address}</p>
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-4">
				<div class="flex items-center gap-1 text-gray-500 dark:text-slate-400">
					<Clock size={12} stroke-width={1.75} aria-hidden="true" />
					<span class="font-inter text-xs">{formatJobTime(job.scheduled_at)}</span>
				</div>
				{#if job.vehicle_label}
					<div class="flex items-center gap-1 text-gray-500 dark:text-slate-400">
						<VehicleIcon size={12} stroke-width={1.75} aria-hidden="true" />
						<span class="font-inter text-xs">{job.vehicle_label}</span>
					</div>
				{/if}
				{#if job.has_notes}
					<div class="flex items-center gap-1 text-amber-600 dark:text-amber-500">
						<FileText size={12} stroke-width={1.75} aria-hidden="true" />
						<span class="font-inter text-xs font-medium">Notes</span>
					</div>
				{/if}
			</div>
		</a>

		{#if job.show_complete_action}
			<a
				href="/jobs/{job.id}/complete"
				class="font-syne flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-brand text-[13px] font-bold text-white transition-opacity hover:opacity-90"
			>
				<CircleCheck size={16} stroke-width={2} aria-hidden="true" />
				Complete this job
			</a>
		{/if}
	</div>

	{#if showCardSyncBadge}
		<div
			class="absolute top-3 right-3 z-10 flex items-center gap-[3px] rounded-md bg-stone-800 px-2 py-[3px]"
			aria-live="polite"
		>
			<RefreshCw size={10} class="text-amber-600" stroke-width={2.5} aria-hidden="true" />
			<span class="font-inter text-[10px] font-semibold text-amber-600">Syncing</span>
		</div>
	{/if}
</div>
