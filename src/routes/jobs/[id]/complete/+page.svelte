<script lang="ts">
	import DriverCompleteJobView from '$lib/components/driver/DriverCompleteJobView.svelte';

	let { data, form } = $props();

	const formError = $derived(
		form && 'message' in form && typeof form.message === 'string' ? form.message : null
	);
</script>

<DriverCompleteJobView job={data.job} {formError} />
