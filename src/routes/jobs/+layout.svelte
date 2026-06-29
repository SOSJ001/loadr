<script lang="ts">
	import { page } from '$app/state';
	import DriverConnectivityBanners from '$lib/components/driver/DriverConnectivityBanners.svelte';
	import DriverPwaInit from '$lib/components/driver/DriverPwaInit.svelte';
	import OperatorResponsiveLayout from '$lib/components/operator/OperatorResponsiveLayout.svelte';
	import DriverResponsiveLayout from '$lib/components/driver/DriverResponsiveLayout.svelte';
	import DriverShell from '$lib/components/driver/DriverShell.svelte';
	import { initTheme, setTheme } from '$lib/stores/theme.svelte';

	let { data, children } = $props();

	const showSubpageOfflineBanner = $derived(
		data.role === 'driver' && page.url.pathname !== '/jobs'
	);

	$effect(() => {
		if (data.role === 'admin') return;

		if (data.jobsThemeHint === 'light') {
			setTheme('light');
			return;
		}

		if (data.jobsThemeHint === 'dark') {
			setTheme('dark');
			return;
		}

		initTheme();
	});
</script>

{#if data.role === 'admin'}
	<OperatorResponsiveLayout
		profile={data.profile}
		companyName={data.companyName}
		plan={data.plan}
	>
		{@render children()}
	</OperatorResponsiveLayout>
{:else}
	<DriverPwaInit />
	<DriverResponsiveLayout profile={data.profile}>
		{#if showSubpageOfflineBanner}
			<DriverConnectivityBanners />
		{/if}
		<DriverShell>{@render children()}</DriverShell>
	</DriverResponsiveLayout>
{/if}
