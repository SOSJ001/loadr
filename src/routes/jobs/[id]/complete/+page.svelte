<script lang="ts">
	import DriverCompleteJobView from '$lib/components/driver/DriverCompleteJobView.svelte';
	import DriverPageLoading from '$lib/components/driver/DriverPageLoading.svelte';

	let { data, form } = $props();

	const formError = $derived(
		form && 'message' in form && typeof form.message === 'string' ? form.message : null
	);
</script>

{#if data.job}
	<DriverCompleteJobView job={data.job} {formError} />
{:else if 'driverClientLoad' in data && data.driverClientLoad}
	<DriverPageLoading label="Loading job…" />
{/if}
