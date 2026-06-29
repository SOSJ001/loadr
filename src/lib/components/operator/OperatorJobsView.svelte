<script lang="ts">
	import JobsFilterBar from '$lib/components/operator/JobsFilterBar.svelte';
	import JobsStatsStrip from '$lib/components/operator/JobsStatsStrip.svelte';
	import JobsTable from '$lib/components/operator/JobsTable.svelte';
	import OperatorPageContent from '$lib/components/operator/OperatorPageContent.svelte';
	import OperatorPageHeader from '$lib/components/operator/OperatorPageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import type { OperatorJobsPageData } from '$lib/types/operator-jobs';
	import type { JobDateFilter, JobStatusFilter } from '$lib/utils/operator-jobs';
	import {
		jobMatchesDateFilter,
		jobMatchesDriverFilter,
		jobMatchesSearch,
		jobMatchesStatusFilter
	} from '$lib/utils/operator-jobs';

	type Props = {
		pageData: OperatorJobsPageData;
	};

	let { pageData }: Props = $props();

	const PAGE_SIZE = 20;

	let searchQuery = $state('');
	let statusFilter = $state<JobStatusFilter>('all');
	let driverFilter = $state('all');
	let dateFilter = $state<JobDateFilter>('any');
	let currentPage = $state(1);

	const statPills = $derived([
		{ label: `${pageData.stats.pending} Pending`, dotClass: 'bg-amber-500' },
		{ label: `${pageData.stats.inProgress} In Progress`, dotClass: 'bg-blue-500' },
		{ label: `${pageData.stats.complete} Complete`, dotClass: 'bg-green-600' },
		{ label: `${pageData.stats.attempted} Attempted`, dotClass: 'bg-red-500' }
	]);

	const filteredJobs = $derived(
		pageData.jobs.filter(
			(job) =>
				jobMatchesSearch(job, searchQuery) &&
				jobMatchesStatusFilter(job, statusFilter) &&
				jobMatchesDriverFilter(job, driverFilter) &&
				jobMatchesDateFilter(job, dateFilter)
		)
	);

	const filteredCount = $derived(filteredJobs.length);

	const totalPages = $derived(Math.max(1, Math.ceil(filteredCount / PAGE_SIZE)));

	const paginatedJobs = $derived(
		filteredJobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);

	let filterKey = $state('');

	$effect(() => {
		const nextKey = `${searchQuery}|${statusFilter}|${driverFilter}|${dateFilter}`;
		if (filterKey && filterKey !== nextKey) {
			currentPage = 1;
		}
		filterKey = nextKey;
	});

	$effect(() => {
		if (currentPage > totalPages) {
			currentPage = totalPages;
		}
	});

	function clearFilters() {
		searchQuery = '';
		statusFilter = 'all';
		driverFilter = 'all';
		dateFilter = 'any';
		currentPage = 1;
	}
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<OperatorPageHeader title="Jobs">
	{#snippet actions()}
		<ThemeToggle />
		<Button href="/jobs/new" variant="brand" class="gap-2">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M8 3.5v9M3.5 8h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
			New Job
		</Button>
	{/snippet}
</OperatorPageHeader>

<OperatorPageContent fill class="gap-4">
	<div class="flex shrink-0 flex-col gap-4">
		<JobsStatsStrip stats={statPills} />

		<JobsFilterBar
			bind:statusFilter
			bind:driverFilter
			bind:dateFilter
			drivers={pageData.drivers}
			onClearFilters={clearFilters}
		/>

		<label class="relative block">
			<span class="sr-only">Search jobs</span>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400 dark:text-slate-500"
				aria-hidden="true"
			>
				<circle cx="7" cy="7" r="4.25" stroke="currentColor" stroke-width="1.5" />
				<path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
			<input
				type="search"
				placeholder="Search jobs by ID, address or driver..."
				bind:value={searchQuery}
				class="font-inter h-11 w-full rounded-lg border border-gray-300 bg-white pr-4 pl-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
			/>
		</label>
	</div>

	<JobsTable
		embedded
		jobs={paginatedJobs}
		totalJobCount={pageData.jobs.length}
		resultCount={filteredCount}
		pageSize={PAGE_SIZE}
		{currentPage}
		{totalPages}
		onClearFilters={clearFilters}
		onPageChange={(page) => {
			currentPage = page;
		}}
	/>
</OperatorPageContent>
