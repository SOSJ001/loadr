<script lang="ts">
	import { navigating, page } from '$app/state';
	import DriverJobDetailView from '$lib/components/driver/DriverJobDetailView.svelte';
	import DriverPageLoading from '$lib/components/driver/DriverPageLoading.svelte';
	import OperatorJobDetailView from '$lib/components/operator/OperatorJobDetailView.svelte';
	import type { DriverJobDetailPageData } from '$lib/types/driver-job-detail';
	import type { OperatorJobDetailPageData } from '$lib/types/operator-job-detail';

	let { data, form } = $props();

	function resolveOperatorPageData(
		record: Record<string, unknown>
	): OperatorJobDetailPageData | undefined {
		if (record.pageData && typeof record.pageData === 'object') {
			return record.pageData as OperatorJobDetailPageData;
		}
		return undefined;
	}

	function isOperatorJobDetail(
		pageData: OperatorJobDetailPageData | undefined,
		role: string
	): pageData is OperatorJobDetailPageData {
		return role === 'admin' && pageData != null;
	}

	function isDriverJobDetail(
		driverPageData: DriverJobDetailPageData | undefined,
		role: string
	): driverPageData is DriverJobDetailPageData {
		return role === 'driver' && driverPageData != null;
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

	const formError = $derived(
		form && 'message' in form && typeof form.message === 'string' ? form.message : null
	);

	const preview = $derived(
		'preview' in mergedRecord && typeof mergedRecord.preview === 'boolean'
			? mergedRecord.preview
			: false
	);

	const operatorPageData = $derived(resolveOperatorPageData(mergedRecord));
	const driverPageData = $derived(
		'driverPageData' in mergedRecord
			? (mergedRecord.driverPageData as DriverJobDetailPageData | undefined)
			: undefined
	);

	let stickyOperatorData = $state<OperatorJobDetailPageData | undefined>(undefined);
	let clientFetchError = $state<string | null>(null);

	$effect(() => {
		if (operatorPageData) {
			stickyOperatorData = operatorPageData;
		}
	});

	$effect(() => {
		if (role !== 'admin' || operatorPageData || stickyOperatorData || preview) return;

		const jobId = page.params.id;
		let cancelled = false;

		void fetch(`/api/v1/jobs/operator-detail/${jobId}`)
			.then(async (response) => {
				if (cancelled) return;
				if (!response.ok) {
					clientFetchError = `Failed to load job (${response.status})`;
					return;
				}
				const body = (await response.json()) as { pageData: OperatorJobDetailPageData };
				stickyOperatorData = body.pageData;
				clientFetchError = null;
				// #region agent log
				fetch('http://127.0.0.1:7339/ingest/beb9541b-9fab-4328-8b18-a7b052a2e513', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f82c8b' },
					body: JSON.stringify({
						sessionId: 'f82c8b',
						runId: 'job-detail-v2',
						hypothesisId: 'H8',
						location: 'jobs/[id]/+page.svelte:client-fetch',
						message: 'client fetch loaded job detail',
						data: { jobId, hasPageData: body.pageData != null },
						timestamp: Date.now()
					})
				}).catch(() => {});
				// #endregion
			})
			.catch(() => {
				if (!cancelled) clientFetchError = 'Failed to load job';
			});

		return () => {
			cancelled = true;
		};
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
		if (isOperatorJobDetail(displayOperatorData, role)) return 'operator';
		if (adminDataMissing) return 'admin-loading';
		if (isDriverJobDetail(driverPageData, role)) return 'driver';
		if ('driverClientLoad' in mergedRecord && mergedRecord.driverClientLoad === true) {
			return 'driver-client-loading';
		}
		return 'blank';
	});

	// #region agent log
	$effect(() => {
		fetch('http://127.0.0.1:7339/ingest/beb9541b-9fab-4328-8b18-a7b052a2e513', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'f82c8b' },
			body: JSON.stringify({
				sessionId: 'f82c8b',
				runId: 'job-detail-v1',
				hypothesisId: 'H1-H4',
				location: 'jobs/[id]/+page.svelte:render',
				message: 'job detail render branch',
				data: {
					branch: renderBranch,
					role,
					jobId: page.params.id,
					propsKeys: Object.keys(propsRecord),
					pageKeys: Object.keys(pageRecord),
					propsHasPageData: mergedRecord.pageData != null,
					hasStickyOperator: stickyOperatorData != null,
					navigating: Boolean(navigating.to)
				},
				timestamp: Date.now()
			})
		}).catch(() => {});
	});
	// #endregion
</script>

{#if showLoading}
	<DriverPageLoading label="Loading job…" />
{:else if isOperatorJobDetail(displayOperatorData, role)}
	<OperatorJobDetailView pageData={displayOperatorData} />
{:else if adminDataMissing}
	{#if clientFetchError}
		<p class="p-6 font-inter text-sm text-red-600">{clientFetchError}</p>
	{:else}
		<DriverPageLoading label="Loading job…" />
	{/if}
{:else if isDriverJobDetail(driverPageData, role)}
	<DriverJobDetailView pageData={driverPageData} {preview} {formError} />
{:else if 'driverClientLoad' in mergedRecord && mergedRecord.driverClientLoad === true}
	<DriverPageLoading label="Loading job…" />
{/if}
