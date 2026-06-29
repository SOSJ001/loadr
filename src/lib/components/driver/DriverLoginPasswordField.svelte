<script lang="ts">
	import { Eye, EyeOff } from '@lucide/svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		name: string;
		label: string;
		placeholder?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		value?: string;
		error?: string;
		invalid?: boolean;
		required?: boolean;
		oninput?: HTMLInputAttributes['oninput'];
	};

	let {
		name,
		label,
		placeholder = '',
		autocomplete = 'current-password',
		value = $bindable(''),
		error = '',
		invalid = false,
		required = false,
		oninput
	}: Props = $props();

	let showPassword = $state(false);

	const hasError = $derived(Boolean(error) || invalid);

	const inputClass = $derived(
		hasError
			? 'border-red-600 focus:border-red-600 dark:border-red-600 dark:focus:border-red-600'
			: 'border-gray-200 focus:border-brand dark:border-slate-700 dark:focus:border-brand'
	);
</script>

<div class="flex w-full flex-col gap-1.5">
	<label for={name} class="font-inter text-xs font-medium text-gray-500 dark:text-slate-400">
		{label}
	</label>
	<div class="relative">
		<input
			id={name}
			{name}
			type={showPassword ? 'text' : 'password'}
			{placeholder}
			{required}
			{autocomplete}
			aria-invalid={hasError ? 'true' : undefined}
			aria-describedby={error ? `${name}-error` : undefined}
			bind:value
			{oninput}
			class="font-inter h-[52px] w-full rounded-[10px] border bg-gray-50 pr-12 pl-4 text-[15px] text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-gray-300 focus:ring-2 focus:ring-brand/20 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 {inputClass}"
		/>
		<button
			type="button"
			class="absolute top-1/2 right-1 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
			aria-label={showPassword ? 'Hide password' : 'Show password'}
			onclick={() => (showPassword = !showPassword)}
		>
			{#if showPassword}
				<EyeOff size={18} stroke-width={1.75} aria-hidden="true" />
			{:else}
				<Eye size={18} stroke-width={1.75} aria-hidden="true" />
			{/if}
		</button>
	</div>
	{#if error}
		<p id="{name}-error" class="font-inter text-xs text-red-600 dark:text-red-400">{error}</p>
	{/if}
</div>
