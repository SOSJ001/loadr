<script lang="ts">
	import { navigating } from '$app/state';
	import DriverJobDetailView from '$lib/components/driver/DriverJobDetailView.svelte';
	import DriverPageLoading from '$lib/components/driver/DriverPageLoading.svelte';
	import OperatorJobDetailView from '$lib/components/operator/OperatorJobDetailView.svelte';
	import type { DriverJobDetailPageData } from '$lib/types/driver-job-detail';
	import type { OperatorJobDetailPageData } from '$lib/types/operator-job-detail';

	let { data, form } = $props();

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

	const formError = $derived(
		form && 'message' in form && typeof form.message === 'string' ? form.message : null
	);

	const preview = $derived(
		'preview' in data && typeof data.preview === 'boolean' ? data.preview : false
	);

	const operatorPageData = $derived(
		'pageData' in data ? (data.pageData as OperatorJobDetailPageData | undefined) : undefined
	);

	const showLoading = $derived(
		Boolean(navigating.to) &&
			data.profile.role === 'driver' &&
			'driverClientLoad' in data &&
			data.driverClientLoad
	);
</script>

{#if showLoading}
	<DriverPageLoading label="Loading job…" />
{:else if isOperatorJobDetail(operatorPageData, data.profile.role)}
	<OperatorJobDetailView pageData={operatorPageData} />
{:else if isDriverJobDetail(data.driverPageData, data.profile.role)}
	<DriverJobDetailView
		pageData={data.driverPageData}
		{preview}
		{formError}
	/>
{:else if 'driverClientLoad' in data && data.driverClientLoad}
	<DriverPageLoading label="Loading job…" />
{/if}
