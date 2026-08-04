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
