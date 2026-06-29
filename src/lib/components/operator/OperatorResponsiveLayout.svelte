<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import OperatorShell from '$lib/components/operator/OperatorShell.svelte';
	import OperatorDesktopRequired from '$lib/components/operator/OperatorDesktopRequired.svelte';
	import { initTheme, setTheme } from '$lib/stores/theme.svelte';
	import { isOperatorDarkPreview } from '$lib/utils/operator-preview';
	import type { UserProfile } from '$lib/types/user';

	type Props = {
		profile?: UserProfile | null;
		companyName?: string;
		plan?: string;
		children: Snippet;
	};

	let { profile = null, companyName = 'Your company', plan = 'free', children }: Props = $props();

	const preview = $derived(page.url.searchParams.get('preview'));
	const forceMobile = $derived(preview === 'mobile' || preview === 'mobile-dark');

	onMount(() => {
		initTheme();
		if (isOperatorDarkPreview(preview)) {
			setTheme('dark');
		}
	});
</script>

<div class={forceMobile ? 'block' : 'lg:hidden'}>
	<OperatorDesktopRequired email={profile?.email} {companyName} />
</div>

<div class={forceMobile ? 'hidden' : 'hidden h-dvh lg:block'}>
	<OperatorShell {profile} {companyName} {plan}>
		{@render children()}
	</OperatorShell>
</div>
