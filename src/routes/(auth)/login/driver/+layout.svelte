<script lang="ts">
	import DriverResponsiveLayout from '$lib/components/driver/DriverResponsiveLayout.svelte';

	let { children } = $props();
</script>

<DriverResponsiveLayout loginPage>
	<div class="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-white dark:bg-slate-900">
		{@render children()}
	</div>
</DriverResponsiveLayout>
