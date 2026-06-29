<script lang="ts">
	import DriverReportIssueSuccessView from '$lib/components/driver/DriverReportIssueSuccessView.svelte';

	let { data } = $props();
</script>

<DriverReportIssueSuccessView job={data.job} preview={data.preview} />
