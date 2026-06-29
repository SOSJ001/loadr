<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import Input from '$lib/components/ui/Input.svelte';

	const bannerTransition = { duration: 280, easing: quintOut, axis: 'y' as const };

	type Props = {
		name?: string;
		value?: string;
		error?: string;
		required?: boolean;
		oninput?: (event: Event & { currentTarget: HTMLInputElement }) => void;
		onSearchAgain?: () => void;
	};

	let {
		name = 'company_name',
		value = $bindable(''),
		error = '',
		required = false,
		oninput,
		onSearchAgain
	}: Props = $props();
</script>

<div class="flex w-full flex-col">
	<Input
		{name}
		label="Company name"
		placeholder="e.g. Dave's Couriers Ltd"
		autocomplete="organization"
		{required}
		{error}
		bind:value
		{oninput}
	/>

	<aside
		in:slide={bannerTransition}
		class="mt-2 flex w-full items-start gap-2 rounded-lg bg-amber-100 px-3 py-2.5 dark:bg-amber-950/40"
		role="note"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			aria-hidden="true"
			class="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
		>
			<circle cx="7" cy="7" r="6.25" stroke="currentColor" stroke-width="1.5" />
			<path d="M7 6.25V9.75M7 4.5h.007" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
		<p class="min-w-0 flex-1 font-inter text-xs leading-normal text-amber-600 sm:hidden dark:text-amber-400">
			We'll manually verify your business after signup This may take up to 1 business day
		</p>
		<p
			class="hidden min-w-0 flex-1 font-inter text-xs leading-normal text-amber-600 sm:block dark:text-amber-400"
		>
			We'll manually verify your business after signup<br />
			This may take up to 1 business day
		</p>
	</aside>

	<button
		type="button"
		class="mt-2 self-start font-inter text-xs font-medium text-brand hover:underline"
		onclick={() => onSearchAgain?.()}
	>
		Search again instead
	</button>
</div>
