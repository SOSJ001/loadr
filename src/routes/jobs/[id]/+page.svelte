<script lang="ts">
	import DriverJobDetailView from '$lib/components/driver/DriverJobDetailView.svelte';
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
</script>

{#if isOperatorJobDetail(data.pageData, data.profile.role)}
	<OperatorJobDetailView pageData={data.pageData} />
{:else if isDriverJobDetail(data.driverPageData, data.profile.role)}
	<DriverJobDetailView
		pageData={data.driverPageData}
		preview={data.preview}
		{formError}
	/>
{/if}
