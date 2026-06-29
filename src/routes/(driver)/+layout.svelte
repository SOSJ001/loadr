<script lang="ts">
	/** Layer 4 — driver shell only. Job flows live under /jobs/[id]/*. */
	import DriverPwaInit from '$lib/components/driver/DriverPwaInit.svelte';
	import DriverResponsiveLayout from '$lib/components/driver/DriverResponsiveLayout.svelte';
	import DriverShell from '$lib/components/driver/DriverShell.svelte';

	let { children, data } = $props();
</script>

<DriverPwaInit />

<DriverResponsiveLayout profile={data.isActivate ? null : data.profile}>
	{#if data.isActivate}
		{@render children()}
	{:else}
		<DriverShell>{@render children()}</DriverShell>
	{/if}
</DriverResponsiveLayout>
