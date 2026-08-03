<script lang="ts">
	import { navigating, page } from '$app/state';
	import DriverMyJobsView from '$lib/components/driver/DriverMyJobsView.svelte';
	import DriverPageLoading from '$lib/components/driver/DriverPageLoading.svelte';
	import OperatorDashboardLoadingView from '$lib/components/operator/skeleton/OperatorDashboardLoadingView.svelte';
	import OperatorJobsView from '$lib/components/operator/OperatorJobsView.svelte';
	import type { DriverJobsPageData } from '$lib/types/driver-jobs';
	import type { OperatorJobsPageData } from '$lib/types/operator-jobs';

	let { data } = $props();

	function operatorJobsFromRecord(
		record: Record<string, unknown>,
		role: string
	): OperatorJobsPageData | null {
		if (role !== 'admin') return null;
		if (
			Array.isArray(record.jobs) &&
			record.stats &&
			typeof record.stats === 'object' &&
			Array.isArray(record.drivers)
		) {
			return {
				jobs: record.jobs as OperatorJobsPageData['jobs'],
				stats: record.stats as OperatorJobsPageData['stats'],
				drivers: record.drivers as OperatorJobsPageData['drivers']
			};
		}
		const nested = record.pageData;
		if (
			nested &&
			typeof nested === 'object' &&
			'drivers' in nested &&
			Array.isArray((nested as OperatorJobsPageData).jobs)
		) {
			return nested as OperatorJobsPageData;
		}
		return null;
	}

	function driverJobsFromRecord(
		record: Record<string, unknown>,
		role: string
	): DriverJobsPageData | null {
		if (role !== 'driver') return null;
		const nested = record.pageData;
		if (nested && typeof nested === 'object' && 'greeting' in nested) {
			return nested as DriverJobsPageData;
		}
		return null;
	}

	const propsRecord = $derived(data as Record<string, unknown>);
	const pageRecord = $derived(page.data as Record<string, unknown>);
	const mergedRecord = $derived(
		Object.keys(propsRecord).length >= Object.keys(pageRecord).length ? propsRecord : pageRecord
	);

	const role = $derived(
		String(
			mergedRecord.profile && typeof mergedRecord.profile === 'object'
				? (mergedRecord.profile as { role?: string }).role
				: (data.profile?.role ?? '')
		)
	);

	const operatorPageData = $derived(operatorJobsFromRecord(mergedRecord, role));
	const driverPageData = $derived(driverJobsFromRecord(mergedRecord, role));

	const preview = $derived(
		'preview' in mergedRecord && typeof mergedRecord.preview === 'boolean'
			? mergedRecord.preview
			: false
	);

	let stickyOperatorData = $state<OperatorJobsPageData | null>(null);

	$effect(() => {
		if (operatorPageData) {
			stickyOperatorData = operatorPageData;
		}
	});

	const displayOperatorData = $derived(operatorPageData ?? stickyOperatorData);
	const adminDataMissing = $derived(role === 'admin' && !displayOperatorData && !preview);

	const showLoading = $derived(
		Boolean(navigating.to) &&
			role === 'driver' &&
			'driverClientLoad' in mergedRecord &&
			mergedRecord.driverClientLoad === true
	);

	const renderBranch = $derived.by(() => {
		if (showLoading) return 'driver-nav-loading';
		if (displayOperatorData) return 'operator';
		if (adminDataMissing) return 'admin-loading';
		if (driverPageData) return 'driver';
		if ('driverClientLoad' in mergedRecord && mergedRecord.driverClientLoad === true) {
			return 'driver-client-loading';
		}
		return 'blank';
	});

	// #region agent log
	$effect(() => {
		const propsKeys = Object.keys(propsRecord);
		const pageKeys = Object.keys(pageRecord);
		fetch('http://127.0.0.1:7339/ingest/beb9541b-9fab-4328-8b18-a7b052a2e513', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f82c8b' },
			body: JSON.stringify({
				sessionId: 'f82c8b',
				runId: 'regression-v1',
				hypothesisId: 'H1-H3',
				location: 'jobs/+page.svelte:render',
				message: 'render branch snapshot',
				data: {
					branch: renderBranch,
					role,
					propsKeys,
					pageKeys,
					propsHasJobs: Array.isArray(propsRecord.jobs),
					pageHasJobs: Array.isArray(pageRecord.jobs),
					hasStickyOperator: stickyOperatorData !== null,
					navigating: Boolean(navigating.to)
				},
				timestamp: Date.now()
			})
		}).catch(() => {});
	});
	// #endregion
</script>

{#if showLoading}
	<DriverPageLoading label="Loading jobs…" />
{:else if displayOperatorData}
	<OperatorJobsView pageData={displayOperatorData} />
{:else if adminDataMissing}
	<OperatorDashboardLoadingView />
{:else if driverPageData}
	<div class="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
		<DriverMyJobsView pageData={driverPageData} {preview} />
	</div>
{:else if 'driverClientLoad' in mergedRecord && mergedRecord.driverClientLoad === true}
	<DriverPageLoading label="Loading jobs…" />
{/if}
