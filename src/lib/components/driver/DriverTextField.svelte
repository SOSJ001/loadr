<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		name: string;
		label: string;
		type?: HTMLInputAttributes['type'];
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
		type = 'text',
		placeholder = '',
		autocomplete,
		value = $bindable(''),
		error = '',
		invalid = false,
		required = false,
		oninput
	}: Props = $props();

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
	<input
		id={name}
		{name}
		{type}
		{placeholder}
		{required}
		{autocomplete}
		aria-invalid={hasError ? 'true' : undefined}
		aria-describedby={error ? `${name}-error` : undefined}
		bind:value
		{oninput}
		class="font-inter h-[52px] w-full rounded-[10px] border bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-gray-300 focus:ring-2 focus:ring-brand/20 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 {inputClass}"
	/>
	{#if error}
		<p id="{name}-error" class="font-inter text-xs text-red-600 dark:text-red-400">{error}</p>
	{/if}
</div>
