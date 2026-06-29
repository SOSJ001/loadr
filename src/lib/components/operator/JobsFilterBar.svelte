<script lang="ts">
	import type { OperatorJobDriverOption } from '$lib/types/operator-jobs';
	import type { JobDateFilter, JobStatusFilter } from '$lib/utils/operator-jobs';
	import { dateFilterLabel, statusFilterLabel } from '$lib/utils/operator-jobs';

	type Props = {
		statusFilter: JobStatusFilter;
		driverFilter: string;
		dateFilter: JobDateFilter;
		drivers: OperatorJobDriverOption[];
		onClearFilters?: () => void;
	};

	let {
		statusFilter = $bindable(),
		driverFilter = $bindable(),
		dateFilter = $bindable(),
		drivers,
		onClearFilters
	}: Props = $props();

	const hasActiveFilters = $derived(
		statusFilter !== 'all' || driverFilter !== 'all' || dateFilter !== 'any'
	);

	const driverLabel = $derived(
		driverFilter === 'all'
			? 'All Drivers'
			: (drivers.find((driver) => driver.id === driverFilter)?.full_name ?? 'All Drivers')
	);

	const selectClass =
		'font-inter h-9 appearance-none rounded-lg border border-gray-300 bg-white py-0 pl-3 pr-8 text-[13px] font-medium text-gray-700 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';
</script>

<div
	class="flex flex-wrap items-center gap-3 rounded-[10px] bg-gray-50 px-4 py-3 dark:bg-slate-800"
>
	<label class="relative inline-flex items-center gap-2">
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			class="pointer-events-none absolute left-3 text-gray-500 dark:text-slate-400"
			aria-hidden="true"
		>
			<path
				d="M1.75 3.5h10.5M3.5 7h7M5.25 10.5h3.5"
				stroke="currentColor"
				stroke-width="1.25"
				stroke-linecap="round"
			/>
		</svg>
		<select bind:value={statusFilter} class="{selectClass} w-[228px] pl-9">
			<option value="all">{statusFilterLabel('all')}</option>
			<option value="pending">{statusFilterLabel('pending')}</option>
			<option value="in_progress">{statusFilterLabel('in_progress')}</option>
			<option value="complete">{statusFilterLabel('complete')}</option>
			<option value="attempted">{statusFilterLabel('attempted')}</option>
		</select>
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			class="pointer-events-none absolute right-2.5 text-gray-500 dark:text-slate-400"
			aria-hidden="true"
		>
			<path
				d="m3.5 5.25 3.5 3.5 3.5-3.5"
				stroke="currentColor"
				stroke-width="1.25"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</label>

	<label class="relative inline-flex items-center">
		<select bind:value={driverFilter} class="{selectClass} w-[196px]">
			<option value="all">All Drivers</option>
			{#each drivers as driver (driver.id)}
				<option value={driver.id}>{driver.full_name}</option>
			{/each}
		</select>
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			class="pointer-events-none absolute right-2.5 text-gray-500 dark:text-slate-400"
			aria-hidden="true"
		>
			<path
				d="m3.5 5.25 3.5 3.5 3.5-3.5"
				stroke="currentColor"
				stroke-width="1.25"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</label>

	<label class="relative inline-flex items-center gap-2">
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			class="pointer-events-none absolute left-3 text-gray-500 dark:text-slate-400"
			aria-hidden="true"
		>
			<path
				d="M2.25 2.5h9.5a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-.75.75h-9.5a.75.75 0 0 1-.75-.75v-7a.75.75 0 0 1 .75-.75Z"
				stroke="currentColor"
				stroke-width="1.25"
			/>
			<path d="M2.25 5.75h10.5M5.25 1.75v1.5M8.75 1.75v1.5" stroke="currentColor" stroke-width="1.25" />
		</svg>
		<select bind:value={dateFilter} class="{selectClass} w-[210px] pl-9">
			<option value="any">{dateFilterLabel('any')}</option>
			<option value="today">{dateFilterLabel('today')}</option>
			<option value="week">{dateFilterLabel('week')}</option>
		</select>
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			class="pointer-events-none absolute right-2.5 text-gray-500 dark:text-slate-400"
			aria-hidden="true"
		>
			<path
				d="m3.5 5.25 3.5 3.5 3.5-3.5"
				stroke="currentColor"
				stroke-width="1.25"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</label>

	<div class="flex-1"></div>

	{#if hasActiveFilters}
		<button
			type="button"
			class="font-inter text-[13px] font-medium text-brand transition-colors hover:text-[#178566]"
			onclick={onClearFilters}
		>
			Clear filters
		</button>
	{/if}
</div>

<!-- Screen reader summary of current filter labels -->
<span class="sr-only">
	Status: {statusFilterLabel(statusFilter)}. Driver: {driverLabel}. Date: {dateFilterLabel(dateFilter)}.
</span>
