<script lang="ts">
	import DriverReportIssueView from '$lib/components/driver/DriverReportIssueView.svelte';
	import DriverPageLoading from '$lib/components/driver/DriverPageLoading.svelte';

	let { data, form } = $props();

	const formError = $derived(
		form && 'message' in form && typeof form.message === 'string' ? form.message : null
	);

	const preview = $derived(
		'preview' in data && typeof data.preview === 'boolean' ? data.preview : false
	);
	const initialSelectedReason = $derived(
		'initialSelectedReason' in data && typeof data.initialSelectedReason === 'string'
			? data.initialSelectedReason
			: ''
	);
	const initialNotes = $derived(
		'initialNotes' in data && typeof data.initialNotes === 'string' ? data.initialNotes : ''
	);
	const initialPhotoAttached = $derived(
		'initialPhotoAttached' in data && typeof data.initialPhotoAttached === 'boolean'
			? data.initialPhotoAttached
			: false
	);
</script>

{#if data.job}
	<DriverReportIssueView
		job={data.job}
		{preview}
		{initialSelectedReason}
		{initialNotes}
		{initialPhotoAttached}
		{formError}
	/>
{:else if 'driverClientLoad' in data && data.driverClientLoad}
	<DriverPageLoading label="Loading job…" />
{/if}
