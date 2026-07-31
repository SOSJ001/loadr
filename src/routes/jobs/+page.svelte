<script lang="ts">
	import { navigating } from '$app/state';
	import DriverMyJobsView from '$lib/components/driver/DriverMyJobsView.svelte';
	import DriverPageLoading from '$lib/components/driver/DriverPageLoading.svelte';
	import OperatorJobsView from '$lib/components/operator/OperatorJobsView.svelte';
	import type { DriverJobsPageData } from '$lib/types/driver-jobs';
	import type { OperatorJobsPageData } from '$lib/types/operator-jobs';

	let { data } = $props();

	function isOperatorPageData(
		pageData: OperatorJobsPageData | DriverJobsPageData | null | undefined,
		role: string
	): pageData is OperatorJobsPageData {
		return role === 'admin' && pageData != null && 'drivers' in pageData;
	}

	function isDriverPageData(
		pageData: OperatorJobsPageData | DriverJobsPageData | null | undefined,
		role: string
	): pageData is DriverJobsPageData {
		return role === 'driver' && pageData != null && 'greeting' in pageData;
	}

	const showLoading = $derived(
		Boolean(navigating.to) &&
			data.profile.role === 'driver' &&
			'driverClientLoad' in data &&
			data.driverClientLoad
	);
	const preview = $derived(
		'preview' in data && typeof data.preview === 'boolean' ? data.preview : false
	);
</script>

{#if showLoading}
	<DriverPageLoading label="Loading jobs…" />
{:else if isOperatorPageData(data.pageData, data.profile.role)}
	<OperatorJobsView pageData={data.pageData} />
{:else if isDriverPageData(data.pageData, data.profile.role)}
	<div class="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
		<DriverMyJobsView pageData={data.pageData} {preview} />
	</div>
{:else if 'driverClientLoad' in data && data.driverClientLoad}
	<DriverPageLoading label="Loading jobs…" />
{/if}
