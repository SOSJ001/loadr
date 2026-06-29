<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { errorPageTitle } from '$lib/utils/error-page';

	type Props = {
		status: number;
		message: string;
		homeHref?: string;
		showThemeToggle?: boolean;
	};

	let { status, message, homeHref = '/', showThemeToggle = true }: Props = $props();

	const title = $derived(errorPageTitle(status));
</script>

<div
	class="flex min-h-dvh flex-col bg-white text-gray-900 dark:bg-slate-950 dark:text-slate-100"
>
	{#if showThemeToggle}
		<div class="flex justify-end p-4 sm:p-6">
			<ThemeToggle />
		</div>
	{/if}

	<div class="flex flex-1 flex-col items-center justify-center px-6 pb-16">
		<p class="font-syne text-[72px] font-extrabold leading-none text-brand/20 sm:text-[96px]">
			{status}
		</p>

		<h1 class="mt-4 font-syne text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">
			{title}
		</h1>

		<p
			class="mt-3 max-w-md text-center font-inter text-sm leading-relaxed text-gray-500 dark:text-slate-400"
		>
			{message}
		</p>

		<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
			<Button href={homeHref} variant="brand">Go back</Button>
			<Button variant="secondary" onclick={() => location.reload()}>Try again</Button>
		</div>
	</div>
</div>
