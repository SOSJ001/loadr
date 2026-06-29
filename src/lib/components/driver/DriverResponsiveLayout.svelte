<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import DriverMobileRequired from '$lib/components/driver/DriverMobileRequired.svelte';
	import { initTheme } from '$lib/stores/theme.svelte';
	import {
		isDriverAppPreviewMode,
		isDriverMobileBlockerPreview
	} from '$lib/utils/driver-responsive';
	import type { UserProfile } from '$lib/types/user';

	type Props = {
		profile?: UserProfile | null;
		loginPage?: boolean;
		children: Snippet;
	};

	let { profile = null, loginPage = false, children }: Props = $props();

	const preview = $derived(page.url.searchParams.get('preview'));
	const previewBlocker = $derived(isDriverMobileBlockerPreview(preview));
	const previewDriverApp = $derived(isDriverAppPreviewMode(preview));

	const mobileRequiredClass = $derived(
		previewBlocker
			? 'flex min-h-dvh w-full'
			: previewDriverApp
				? 'hidden'
				: 'hidden min-h-dvh w-full lg:flex'
	);

	const driverAppClass = $derived(
		previewBlocker
			? 'hidden'
			: previewDriverApp
				? 'block h-dvh w-full overflow-hidden'
				: 'block h-dvh w-full overflow-hidden lg:hidden'
	);

	onMount(() => {
		initTheme();
	});
</script>

<div class={mobileRequiredClass}>
	<DriverMobileRequired
		driverName={profile?.full_name}
		phone={profile?.phone}
		{loginPage}
	/>
</div>

<div class={driverAppClass}>
	{@render children()}
</div>
