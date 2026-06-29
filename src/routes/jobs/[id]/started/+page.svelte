<script lang="ts">
	import DriverJobStartedView from '$lib/components/driver/DriverJobStartedView.svelte';

	let { data } = $props();
</script>

<DriverJobStartedView pageData={data.pageData} enableAutoDirections={data.freshStart} />
