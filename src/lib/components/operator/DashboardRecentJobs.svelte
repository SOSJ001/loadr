<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import OperatorJobStatusBadge from '$lib/components/operator/OperatorJobStatusBadge.svelte';
	import type { DashboardJobRow } from '$lib/types/dashboard';
	import { driverInitials, formatDashboardDate } from '$lib/utils/dashboard';

	type Props = {
		jobs?: DashboardJobRow[];
		hoverPreviewJobId?: string | null;
		actionsLocked?: boolean;
	};

	let { jobs = [], hoverPreviewJobId = null, actionsLocked = false }: Props = $props();

	const actionClass =
		'text-gray-500 transition-colors hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100';

	const rowHoverClass =
		'cursor-pointer transition-colors duration-150 hover:bg-emerald-50 dark:hover:bg-emerald-950/40';

	function rowClass(index: number, jobId: string) {
		const isHoverPreview = hoverPreviewJobId === jobId;
		const stripe =
			index % 2 === 1 ? 'bg-gray-50 dark:bg-[#1a2744]' : 'bg-white dark:bg-slate-800';

		return isHoverPreview
			? `${rowHoverClass} bg-emerald-50 dark:bg-emerald-950/40`
			: `${rowHoverClass} ${stripe}`;
	}

	function openJob(jobId: string) {
		goto(`/jobs/${jobId}`);
	}

	function stopRowClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
	}
</script>

<section>
	<div class="mb-4 flex items-center justify-between gap-4">
		<h2 class="font-syne text-lg font-bold text-gray-900 dark:text-slate-100">Recent Jobs</h2>
		<a
			href="/jobs"
			class="font-syne text-[13px] font-medium text-brand transition-colors hover:text-[#178566]"
		>
			View all jobs →
		</a>
	</div>

	{#if jobs.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-800"
		>
			<svg
				width="48"
				height="48"
				viewBox="0 0 48 48"
				fill="none"
				class="text-gray-300 dark:text-slate-600"
				aria-hidden="true"
			>
				<path
					d="M14 10h20a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z"
					stroke="currentColor"
					stroke-width="2"
				/>
				<path d="M18 18h12M18 24h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			</svg>
			<p class="font-syne mt-4 text-base font-bold text-gray-900 dark:text-slate-100">No jobs yet</p>
			<p class="font-syne mt-2 text-sm font-bold text-gray-500 dark:text-slate-400">
				Create your first job to get started
			</p>
			<Button href="/jobs/new" variant="brand" class="mt-6 gap-2" disabled={actionsLocked}>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path
						d="M8 3.5v9M3.5 8h9"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
				New Job
			</Button>
		</div>
	{:else}
		<div
			class="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800"
		>
			<table class="min-w-[920px] w-full text-left">
				<thead>
					<tr class="border-b border-gray-200 bg-gray-100 dark:border-slate-700 dark:bg-slate-900">
						<th
							class="font-syne w-20 px-5 py-3 text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400"
						>
							Job ID
						</th>
						<th
							class="font-syne px-5 py-3 text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400"
						>
							Pickup
						</th>
						<th
							class="font-syne px-5 py-3 text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400"
						>
							Drop off
						</th>
						<th
							class="font-syne w-[140px] px-5 py-3 text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400"
						>
							Driver
						</th>
						<th
							class="font-syne w-[120px] px-5 py-3 text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400"
						>
							Status
						</th>
						<th
							class="font-syne w-[110px] px-5 py-3 text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400"
						>
							Date
						</th>
						<th
							class="font-syne w-20 px-5 py-3 text-right text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					{#each jobs as job, index (job.id)}
						<tr
							class="border-b border-gray-200 last:border-b-0 dark:border-slate-700 {rowClass(
								index,
								job.id
							)}"
							role="link"
							tabindex="0"
							aria-label="Open job {job.reference}"
							onclick={() => openJob(job.id)}
							onkeydown={(event) => {
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault();
									openJob(job.id);
								}
							}}
						>
							<td
								class="font-mono px-5 py-4 text-[13px] text-gray-500 dark:text-slate-400"
							>
								{job.reference}
							</td>
							<td
								class="font-inter max-w-[200px] truncate px-5 py-4 text-[13px] text-gray-900 dark:text-slate-100"
							>
								{job.pickup_address}
							</td>
							<td
								class="font-inter max-w-[200px] truncate px-5 py-4 text-[13px] text-gray-900 dark:text-slate-100"
							>
								{job.dropoff_address}
							</td>
							<td class="px-5 py-4">
								{#if job.driver_name}
									<div class="flex items-center gap-2">
										<div
											class="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand font-inter text-[10px] font-semibold text-white"
											aria-hidden="true"
										>
											{driverInitials(job.driver_name)}
										</div>
										<span
											class="font-inter text-[13px] font-medium text-gray-900 dark:text-slate-100"
										>
											{job.driver_name}
										</span>
									</div>
								{:else}
									<span class="font-inter text-[13px] text-gray-500 dark:text-slate-400">—</span>
								{/if}
							</td>
							<td class="px-5 py-4">
								<OperatorJobStatusBadge status={job.status} />
							</td>
							<td
								class="font-inter px-5 py-4 text-[13px] whitespace-nowrap text-gray-500 dark:text-slate-400"
							>
								{formatDashboardDate(job.scheduled_at)}
							</td>
							<td class="px-5 py-4">
								<div class="flex items-center justify-end gap-2">
									<a
										href="/jobs/{job.id}"
										class={actionClass}
										aria-label="View {job.reference}"
										onclick={stopRowClick}
									>
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
											<path
												d="M2.5 8s2.25-3.5 5.5-3.5S13.5 8 13.5 8s-2.25 3.5-5.5 3.5S2.5 8 2.5 8Z"
												stroke="currentColor"
												stroke-width="1.5"
												stroke-linejoin="round"
											/>
											<circle cx="8" cy="8" r="1.75" stroke="currentColor" stroke-width="1.5" />
										</svg>
									</a>
									<a
										href="/jobs/{job.id}/edit"
										class={actionClass}
										aria-label="Edit {job.reference}"
										onclick={stopRowClick}
									>
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
											<path
												d="M10.5 2.5 13.5 5.5 5.5 13.5H2.5v-3l8-8Z"
												stroke="currentColor"
												stroke-width="1.5"
												stroke-linejoin="round"
											/>
										</svg>
									</a>
									<button
										type="button"
										class={actionClass}
										aria-label="More actions for {job.reference}"
										onclick={stopRowClick}
									>
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
											<circle cx="3" cy="8" r="1" fill="currentColor" />
											<circle cx="8" cy="8" r="1" fill="currentColor" />
											<circle cx="13" cy="8" r="1" fill="currentColor" />
										</svg>
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
