<script lang="ts">
	import DriverMyJobsView from '$lib/components/driver/DriverMyJobsView.svelte';
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
</script>

{#if isOperatorPageData(data.pageData, data.profile.role)}
	<OperatorJobsView pageData={data.pageData} />
{:else if isDriverPageData(data.pageData, data.profile.role)}
	<div class="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
		<DriverMyJobsView pageData={data.pageData} preview={data.preview} />
	</div>
{/if}
