<script lang="ts">
	import DriverReportIssueSuccessView from '$lib/components/driver/DriverReportIssueSuccessView.svelte';
	import DriverPageLoading from '$lib/components/driver/DriverPageLoading.svelte';

	let { data } = $props();

	const preview = $derived(
		'preview' in data && typeof data.preview === 'boolean' ? data.preview : false
	);
</script>

{#if data.job}
	<DriverReportIssueSuccessView job={data.job} {preview} />
{:else if 'driverClientLoad' in data && data.driverClientLoad}
	<DriverPageLoading label="Loading job…" />
{/if}
