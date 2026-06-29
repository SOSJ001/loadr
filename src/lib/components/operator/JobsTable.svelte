<script lang="ts">
	import { goto } from '$app/navigation';
	import OperatorJobStatusBadge from '$lib/components/operator/OperatorJobStatusBadge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { OperatorJobListRow } from '$lib/types/operator-jobs';
	import { driverInitials } from '$lib/utils/dashboard';
	import {
		formatOperatorJobDateTime,
		jobAddressLines,
		paginationPageNumbers,
		paginationRangeLabel
	} from '$lib/utils/operator-jobs';

	type Props = {
		jobs?: OperatorJobListRow[];
		totalJobCount?: number;
		resultCount?: number;
		filteredCount?: number;
		embedded?: boolean;
		onClearFilters?: () => void;
		currentPage?: number;
		pageSize?: number;
		totalPages?: number;
		onPageChange?: (page: number) => void;
	};

	let {
		jobs = [],
		totalJobCount = jobs.length,
		resultCount = jobs.length,
		filteredCount = resultCount,
		embedded = false,
		onClearFilters,
		currentPage = 1,
		pageSize = 20,
		totalPages = 1,
		onPageChange
	}: Props = $props();

	const isInitialEmpty = $derived(!embedded && jobs.length === 0 && totalJobCount === 0);
	const isFilterEmpty = $derived(
		embedded ? filteredCount === 0 : jobs.length === 0 && totalJobCount > 0
	);

	const paginationLabel = $derived(paginationRangeLabel(currentPage, pageSize, resultCount));

	const visiblePages = $derived(paginationPageNumbers(currentPage, totalPages));

	const actionClass =
		'text-gray-500 transition-colors hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100';

	const rowHoverClass =
		'cursor-pointer transition-colors duration-150 hover:bg-emerald-50 dark:hover:bg-emerald-950/40';

	const headerClass =
		'font-inter text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:text-slate-400';

	const sortIconClass = 'shrink-0 text-gray-400 dark:text-slate-500';

	function rowClass(index: number) {
		const lightStripe = index % 2 === 1 ? 'bg-gray-50/50' : 'bg-white';
		return `${rowHoverClass} ${lightStripe} dark:bg-slate-900`;
	}

	function openJob(jobId: string) {
		goto(`/jobs/${jobId}`);
	}

	function stopRowClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
	}

	function goToPage(page: number) {
		if (page < 1 || page > totalPages || page === currentPage) return;
		onPageChange?.(page);
	}
</script>

{#if isInitialEmpty}
	<div
		class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900"
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
		<p class="font-inter mt-4 text-base font-semibold text-gray-900 dark:text-slate-100">No jobs yet</p>
		<p class="font-inter mt-2 text-sm text-gray-500 dark:text-slate-400">
			Create your first job to get started
		</p>
		<Button href="/jobs/new" variant="brand" class="mt-6 gap-2">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M8 3.5v9M3.5 8h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
			New Job
		</Button>
	</div>
{:else}
	<div class="flex min-h-0 flex-col {embedded ? 'flex-1' : ''}">
		<div
			class="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 {embedded
				? 'flex-1'
				: ''}"
		>
			{#if isFilterEmpty}
				<div
					class="flex h-11 shrink-0 items-center border-b border-gray-200 bg-gray-50 px-4 dark:border-slate-700 dark:bg-slate-800"
					aria-hidden="true"
				>
					<div
						class="size-4 shrink-0 rounded border border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-900"
					></div>
				</div>
				<div
					class="flex min-h-[240px] flex-1 flex-col items-center justify-center gap-3 bg-white px-6 py-16 text-center dark:bg-slate-900"
				>
				<svg
					width="48"
					height="48"
					viewBox="0 0 48 48"
					fill="none"
					class="text-gray-300 dark:text-slate-600"
					aria-hidden="true"
				>
					<circle cx="20" cy="20" r="11" stroke="currentColor" stroke-width="2" />
					<path d="M29 29 37 37" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					<path d="M20 15v10M15 20h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
				<p class="font-inter text-base font-semibold text-gray-900 dark:text-slate-100">No jobs found</p>
				<p class="font-inter text-sm text-gray-500 dark:text-slate-400">
					Try adjusting your filters or search term
				</p>
				<button
					type="button"
					class="font-inter text-[13px] font-medium text-brand transition-colors hover:text-[#178566]"
					onclick={onClearFilters}
				>
					Clear all filters
				</button>
			</div>
			{:else}
				<div class="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
				<table class="min-w-[960px] w-full table-fixed text-left">
					<colgroup>
						<col class="w-12" />
						<col class="w-[90px]" />
						<col />
						<col />
						<col class="w-[150px]" />
						<col class="w-[130px]" />
						<col class="w-[110px]" />
						<col class="w-[90px]" />
					</colgroup>
					<thead>
						<tr
							class="sticky top-0 z-10 h-11 border-b border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800"
						>
							<th class="px-4 py-3" scope="col">
								<div
									class="size-4 rounded border border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-900"
									aria-hidden="true"
								></div>
							</th>
							<th class="px-4 py-3" scope="col">
								<div class="flex items-center gap-1">
									<span class={headerClass}>Job ID</span>
									<svg width="12" height="12" viewBox="0 0 12 12" fill="none" class={sortIconClass} aria-hidden="true">
										<path d="M3 4.5 6 1.5 9 4.5M3 7.5 6 10.5 9 7.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
									</svg>
								</div>
							</th>
							<th class="px-4 py-3" scope="col">
								<div class="flex items-center gap-1">
									<span class={headerClass}>Pickup</span>
									<svg width="12" height="12" viewBox="0 0 12 12" fill="none" class={sortIconClass} aria-hidden="true">
										<path d="M3 4.5 6 1.5 9 4.5M3 7.5 6 10.5 9 7.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
									</svg>
								</div>
							</th>
							<th class="px-4 py-3" scope="col">
								<div class="flex items-center gap-1">
									<span class={headerClass}>Drop off</span>
									<svg width="12" height="12" viewBox="0 0 12 12" fill="none" class={sortIconClass} aria-hidden="true">
										<path d="M3 4.5 6 1.5 9 4.5M3 7.5 6 10.5 9 7.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
									</svg>
								</div>
							</th>
							<th class="px-4 py-3" scope="col">
								<div class="flex items-center gap-1">
									<span class={headerClass}>Driver</span>
									<svg width="12" height="12" viewBox="0 0 12 12" fill="none" class={sortIconClass} aria-hidden="true">
										<path d="M3 4.5 6 1.5 9 4.5M3 7.5 6 10.5 9 7.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
									</svg>
								</div>
							</th>
							<th class="px-4 py-3" scope="col">
								<div class="flex items-center gap-1">
									<span class={headerClass}>Status</span>
									<svg width="12" height="12" viewBox="0 0 12 12" fill="none" class={sortIconClass} aria-hidden="true">
										<path d="M3 4.5 6 1.5 9 4.5M3 7.5 6 10.5 9 7.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
									</svg>
								</div>
							</th>
							<th class="px-4 py-3" scope="col">
								<div class="flex items-center gap-1">
									<span class={headerClass}>Date</span>
									<svg width="12" height="12" viewBox="0 0 12 12" fill="none" class={sortIconClass} aria-hidden="true">
										<path d="M3 4.5 6 1.5 9 4.5M3 7.5 6 10.5 9 7.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
									</svg>
								</div>
							</th>
							<th class="px-4 py-3" scope="col">
								<span class={headerClass}>Actions</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{#each jobs as job, index (job.id)}
							{@const addresses = jobAddressLines(job)}
							{@const dateTime = formatOperatorJobDateTime(job.scheduled_at)}
							<tr
								class="border-b border-gray-200 last:border-b-0 dark:border-slate-700 {rowClass(index)}"
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
								<td class="px-4 py-3">
									<input
										type="checkbox"
										class="size-4 rounded border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-900"
										aria-label="Select {job.reference}"
										onclick={stopRowClick}
									/>
								</td>
								<td class="px-4 py-3">
									<span
										class="font-mono text-[13px] text-gray-900 dark:text-slate-100"
										style="font-family: 'DM Mono', ui-monospace, monospace"
									>
										{job.reference}
									</span>
								</td>
								<td class="px-4 py-3">
									<div class="flex flex-col gap-0.5">
										<span
											class="font-inter truncate text-[13px] font-medium text-gray-900 dark:text-slate-100"
										>
											{addresses.pickup.line1}
										</span>
										{#if addresses.pickup.line2}
											<span class="font-inter truncate text-xs text-gray-500 dark:text-slate-400">
												{addresses.pickup.line2}
											</span>
										{/if}
									</div>
								</td>
								<td class="px-4 py-3">
									<div class="flex flex-col gap-0.5">
										<span
											class="font-inter truncate text-[13px] font-medium text-gray-900 dark:text-slate-100"
										>
											{addresses.dropoff.line1}
										</span>
										{#if addresses.dropoff.line2}
											<span class="font-inter truncate text-xs text-gray-500 dark:text-slate-400">
												{addresses.dropoff.line2}
											</span>
										{/if}
									</div>
								</td>
								<td class="px-4 py-3">
									{#if job.driver_name}
										<div class="flex items-center gap-2">
											<div
												class="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand font-inter text-[10px] font-semibold text-white"
												aria-hidden="true"
											>
												{driverInitials(job.driver_name)}
											</div>
											<span
												class="font-inter truncate text-[13px] text-gray-900 dark:text-slate-100"
											>
												{job.driver_name}
											</span>
										</div>
									{:else}
										<div class="flex items-center gap-2">
											<svg
												width="16"
												height="16"
												viewBox="0 0 16 16"
												fill="none"
												class="shrink-0 text-gray-400 dark:text-slate-500"
												aria-hidden="true"
											>
												<path
													d="M8 8a2.667 2.667 0 1 0 0-5.334A2.667 2.667 0 0 0 8 8Z"
													stroke="currentColor"
													stroke-width="1.25"
												/>
												<path
													d="M3.333 14c0-2.577 2.087-4.667 4.667-4.667"
													stroke="currentColor"
													stroke-width="1.25"
													stroke-linecap="round"
												/>
												<path
													d="m11.333 3.333 2.334 2.334M13.667 3.333 11.333 5.667"
													stroke="currentColor"
													stroke-width="1.25"
													stroke-linecap="round"
												/>
											</svg>
											<span class="font-inter text-[13px] text-gray-400 dark:text-slate-400">
												Unassigned
											</span>
										</div>
									{/if}
								</td>
								<td class="px-4 py-3">
									<OperatorJobStatusBadge status={job.status} />
								</td>
								<td class="px-4 py-3">
									<div class="flex flex-col gap-0.5">
										<span class="font-inter text-[13px] text-gray-900 dark:text-slate-100">
											{dateTime.date}
										</span>
										<span class="font-inter text-xs text-gray-500 dark:text-slate-400">
											{dateTime.time}
										</span>
									</div>
								</td>
								<td class="px-4 py-3">
									<button
										type="button"
										class="{actionClass} flex size-8 items-center justify-center rounded-lg"
										aria-label="More actions for {job.reference}"
										onclick={stopRowClick}
									>
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
											<circle cx="3" cy="8" r="1" fill="currentColor" />
											<circle cx="8" cy="8" r="1" fill="currentColor" />
											<circle cx="13" cy="8" r="1" fill="currentColor" />
										</svg>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				</div>
			{/if}

			<div
				class="flex shrink-0 items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
			>
				<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">
					{paginationLabel}
				</p>

				<div class="flex items-center gap-2">
					<button
						type="button"
						class="flex size-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
						disabled={currentPage <= 1}
						aria-label="Previous page"
						onclick={() => goToPage(currentPage - 1)}
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path
								d="M10 12 6 8l4-4"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
					</button>

					{#each visiblePages as page (page)}
						<button
							type="button"
							class="flex size-8 items-center justify-center rounded-lg border text-[13px] font-medium transition-colors {page ===
							currentPage
								? 'border-brand bg-brand text-white'
								: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700'}"
							aria-label="Page {page}"
							aria-current={page === currentPage ? 'page' : undefined}
							onclick={() => goToPage(page)}
						>
							{page}
						</button>
					{/each}

					<button
						type="button"
						class="flex size-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
						disabled={currentPage >= totalPages}
						aria-label="Next page"
						onclick={() => goToPage(currentPage + 1)}
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path
								d="M6 4l4 4-4 4"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
