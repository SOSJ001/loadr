<script lang="ts">
	import OperatorEditJobView from '$lib/components/operator/OperatorEditJobView.svelte';
	import type { CreateJobFormSeed } from '$lib/utils/operator-create-job';

	let { data, form } = $props();

	type EditJobFormResult = {
		message?: string;
		seed?: CreateJobFormSeed;
	};

	const formResult = $derived(form as EditJobFormResult | undefined);
	const seed = $derived(formResult?.seed ?? data.seed);
	const viewKey = $derived(formResult?.seed ? JSON.stringify(formResult.seed) : JSON.stringify(data.seed));
</script>

{#key viewKey}
	<OperatorEditJobView
		jobId={data.jobId}
		reference={data.reference}
		drivers={data.drivers}
		deletable={data.status !== 'complete'}
		seed={seed}
		errorMessage={formResult?.message ?? null}
	/>
{/key}
