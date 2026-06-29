<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { JobSummary } from '$lib/types/job';

	type Props = { job: JobSummary };

	let { job }: Props = $props();
</script>

<Card title={job.reference}>
	<p class="text-sm text-gray-600">{job.pickup_address}</p>
	<p class="text-sm text-gray-600">→ {job.dropoff_address}</p>
	<div class="mt-2"><Badge label={job.status} /></div>
</Card>
