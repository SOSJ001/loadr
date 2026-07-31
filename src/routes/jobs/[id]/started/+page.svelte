<script lang="ts">
	import DriverJobStartedView from '$lib/components/driver/DriverJobStartedView.svelte';
	import DriverPageLoading from '$lib/components/driver/DriverPageLoading.svelte';

	let { data } = $props();

	const preview = $derived(
		'preview' in data && typeof data.preview === 'boolean' ? data.preview : false
	);
	const freshStart = $derived(
		'freshStart' in data && typeof data.freshStart === 'boolean' ? data.freshStart : false
	);
</script>

{#if data.pageData}
	<DriverJobStartedView pageData={data.pageData} enableAutoDirections={freshStart} />
{:else if 'driverClientLoad' in data && data.driverClientLoad}
	<DriverPageLoading label="Loading job…" />
{/if}
