<script lang="ts">
	import OperatorJobStatusBadge from '$lib/components/operator/OperatorJobStatusBadge.svelte';
	import type { DriverJobTab, DriverJobTabCounts, DriverProfileJobRow } from '$lib/types/drivers';

	type Props = {
		jobsThisMonth: number;
		counts: DriverJobTabCounts;
		rows: DriverProfileJobRow[];
		pagination: { from: number; to: number; total: number };
		initialTab?: DriverJobTab;
	};

	let { jobsThisMonth, counts, rows, pagination, initialTab = 'all' }: Props = $props();

	let activeTab = $state<DriverJobTab>('all');

	const tabs: { id: DriverJobTab; label: string }[] = [
		{ id: 'all', label: 'All' },
		{ id: 'pending', label: 'Pending' },
		{ id: 'in_progress', label: 'In Progress' },
		{ id: 'complete', label: 'Complete' },
		{ id: 'attempted', label: 'Attempted' }
	];

	const filteredRows = $derived(
		activeTab === 'all' ? rows : rows.filter((row) => row.status === activeTab)
	);

	const isEmpty = $derived(rows.length === 0);
	const isFilterEmpty = $derived(!isEmpty && filteredRows.length === 0);

	$effect(() => {
		activeTab = initialTab;
	});

	const headerClass =
		'font-syne px-4 py-2.5 text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400';

	function tabCount(tab: DriverJobTab) {
		return counts[tab];
	}

	function tabButtonClass(tab: DriverJobTab) {
		const active = activeTab === tab;
		return active
			? 'border-2 border-green-600 bg-green-100 text-green-600 dark:border-green-600 dark:bg-green-900 dark:text-green-500'
			: 'border-2 border-transparent text-gray-500 dark:text-slate-400';
	}

	function tabBadgeClass(tab: DriverJobTab) {
		return activeTab === tab
			? 'bg-green-600 text-white'
			: 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400';
	}
</script>

<section
	class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-slate-700 dark:bg-slate-800"
>
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<h2 class="font-inter text-base font-bold text-gray-900 dark:text-slate-100">Jobs</h2>
			<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">
				{jobsThisMonth} this month
			</p>
		</div>
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			class="text-gray-400 dark:text-slate-500"
			aria-hidden="true"
		>
			<path
				d="M5 3.5h6a1 1 0 0 1 1 1v8H4V4.5a1 1 0 0 1 1-1Z"
				stroke="currentColor"
				stroke-width="1.5"
			/>
			<path
				d="M6 6.5h4M6 9h4"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
			/>
		</svg>
	</div>

	<div class="flex flex-wrap gap-1" role="tablist" aria-label="Filter jobs by status">
		{#each tabs as tab (tab.id)}
			<button
				type="button"
				role="tab"
				aria-selected={activeTab === tab.id}
				class="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-inter text-[13px] font-medium transition-colors {tabButtonClass(
					tab.id
				)}"
				onclick={() => {
					activeTab = tab.id;
				}}
			>
				{tab.label}
				<span
					class="rounded-full px-1.5 py-px font-syne text-[11px] font-bold {tabBadgeClass(tab.id)}"
				>
					{tabCount(tab.id)}
				</span>
			</button>
		{/each}
	</div>

	<div
		class="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-slate-700 dark:bg-transparent"
	>
		{#if isEmpty}
			<div class="flex flex-col items-center justify-center gap-1 py-10 text-center">
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					class="text-gray-400 dark:text-slate-500"
					aria-hidden="true"
				>
					<path
						d="M5 3.5h6a1 1 0 0 1 1 1v8H4V4.5a1 1 0 0 1 1-1Z"
						stroke="currentColor"
						stroke-width="1.5"
					/>
					<path
						d="M6 6.5h4M6 9h4"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
				<p class="font-inter text-[15px] font-bold text-gray-900 dark:text-slate-100">No jobs yet</p>
				<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">
					This driver hasn't been assigned any jobs
				</p>
			</div>
		{:else if isFilterEmpty}
			<div class="flex flex-col items-center justify-center gap-1 py-10 text-center">
				<p class="font-inter text-[15px] font-bold text-gray-900 dark:text-slate-100">
					No {tabs.find((tab) => tab.id === activeTab)?.label.toLowerCase()} jobs
				</p>
				<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">
					Try another filter or check back later
				</p>
			</div>
		{:else}
			<table class="min-w-[560px] w-full text-left">
			<thead>
				<tr class="border-b border-gray-200 bg-gray-100 dark:border-slate-700 dark:bg-slate-900">
					<th class="{headerClass} w-20">Job ID</th>
					<th class={headerClass}>Pickup</th>
					<th class={headerClass}>Drop off</th>
					<th class="{headerClass} w-[120px] min-w-[120px]">Status</th>
					<th class="{headerClass} w-[100px]">Date</th>
					<th class="{headerClass} w-[60px] text-right">Action</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredRows as job (job.id)}
					<tr class="border-b border-gray-200 last:border-b-0 dark:border-slate-700">
						<td class="px-4 py-3">
							<span class="font-mono text-xs text-gray-500 dark:text-slate-400">
								{job.reference}
							</span>
						</td>
						<td class="max-w-[140px] truncate px-4 py-3">
							<span class="font-inter text-[13px] text-gray-900 dark:text-slate-100">
								{job.pickup_address}
							</span>
						</td>
						<td class="max-w-[140px] truncate px-4 py-3">
							<span class="font-inter text-[13px] text-gray-900 dark:text-slate-100">
								{job.dropoff_address}
							</span>
						</td>
						<td class="whitespace-nowrap px-4 py-3">
							<OperatorJobStatusBadge status={job.status} />
						</td>
						<td class="px-4 py-3">
							<span class="font-inter text-xs text-gray-500 dark:text-slate-400">
								{job.date_label}
							</span>
						</td>
						<td class="px-4 py-3 text-right">
							{#if job.show_view_action}
								<a
									href="/jobs/{job.id}"
									class="inline-flex text-gray-500 transition-colors hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
									aria-label="View job {job.reference}"
								>
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
										<path
											d="M2.5 8s2.25-3.5 5.5-3.5S13.5 8 13.5 8s-2.25 3.5-5.5 3.5S2.5 8 2.5 8Z"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linejoin="round"
										/>
										<circle
											cx="8"
											cy="8"
											r="1.75"
											stroke="currentColor"
											stroke-width="1.5"
										/>
									</svg>
								</a>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{/if}
	</div>

	{#if !isEmpty}
	<div class="flex items-center justify-end gap-2">
		<p class="font-inter text-xs text-gray-500 dark:text-slate-400">
			{pagination.from}–{pagination.to} of {pagination.total}
		</p>
		<button
			type="button"
			class="flex size-7 items-center justify-center rounded-md border border-gray-200 text-gray-400 dark:border-slate-700 dark:text-slate-500"
			aria-label="Previous page"
			disabled
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path
					d="m10 4-4 4 4 4"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
		<button
			type="button"
			class="flex size-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:text-gray-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
			aria-label="Next page"
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path
					d="m6 4 4 4-4 4"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	</div>
	{/if}
</section>
