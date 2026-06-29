<script lang="ts">
	import OperatorCreateJobView from '$lib/components/operator/OperatorCreateJobView.svelte';
	import type { CreateJobFormSeed } from '$lib/utils/operator-create-job';

	let { data, form } = $props();

	const seed = $derived((form?.seed ?? data.seed) as CreateJobFormSeed | null | undefined);

	const viewKey = $derived(form?.seed ? JSON.stringify(form.seed) : (data.seed ? JSON.stringify(data.seed) : 'empty'));
</script>

{#key viewKey}
	<OperatorCreateJobView
		drivers={data.drivers}
		seed={seed ?? null}
		forceValidation={data.forceValidation}
		showDiscardModal={data.showDiscardModal}
		errorMessage={form?.message ?? null}
	/>
{/key}
