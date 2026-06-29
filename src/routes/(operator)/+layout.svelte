<script lang="ts">
	/** Layer 4 — operator shell only. Nav links to shared /jobs tree. */
	import OperatorResponsiveLayout from '$lib/components/operator/OperatorResponsiveLayout.svelte';

	let { data, children } = $props();
</script>

<OperatorResponsiveLayout
	profile={data.profile}
	companyName={data.companyName}
	plan={data.plan}
>
	{@render children()}
</OperatorResponsiveLayout>
