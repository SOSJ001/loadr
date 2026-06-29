<script lang="ts">
	import DriverReportIssueView from '$lib/components/driver/DriverReportIssueView.svelte';

	let { data, form } = $props();

	const formError = $derived(
		form && 'message' in form && typeof form.message === 'string' ? form.message : null
	);
</script>

<DriverReportIssueView
	job={data.job}
	preview={data.preview}
	initialSelectedReason={data.initialSelectedReason}
	initialNotes={data.initialNotes}
	initialPhotoAttached={data.initialPhotoAttached}
	{formError}
/>
