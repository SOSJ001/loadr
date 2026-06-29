<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		id?: string;
		name?: string;
		type?: string;
		label?: string;
		placeholder?: string;
		value?: string;
		error?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		required?: boolean;
		labelClass?: string;
		class?: string;
		oninput?: (event: Event & { currentTarget: HTMLInputElement }) => void;
	};

	let {
		id,
		name,
		type = 'text',
		label,
		placeholder = '',
		value = $bindable(''),
		error = '',
		autocomplete,
		required = false,
		labelClass = '',
		class: className = '',
		oninput
	}: Props = $props();

	const inputId = $derived(id ?? name);

	const inputClass = $derived(
		error
			? 'border-red-600 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)] dark:border-red-500 dark:focus:border-red-500 dark:focus:shadow-[0_0_0_3px_rgba(248,113,113,0.2)]'
			: 'border-gray-200 focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,158,117,0.15)] dark:border-slate-700 dark:focus:border-brand dark:focus:shadow-[0_0_0_3px_rgba(29,158,117,0.25)]'
	);
</script>

<div class="flex w-full flex-col gap-1.5 {className}">
	{#if label}
		<label
			for={inputId}
			class="font-inter text-xs font-medium text-gray-500 dark:text-slate-400 {labelClass}"
			>{label}</label
		>
	{/if}
	<input
		id={inputId}
		{name}
		{type}
		{placeholder}
		{autocomplete}
		{required}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${inputId}-error` : undefined}
		bind:value
		{oninput}
		class="font-inter h-12 min-h-12 w-full rounded-lg border bg-white px-3.5 text-sm text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-gray-300 focus:border-2 focus:ring-0 sm:h-11 sm:min-h-11 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 {inputClass}"
	/>
	{#if error}
		<p id="{inputId}-error" class="font-inter text-xs text-red-600 dark:text-red-500">{error}</p>
	{/if}
</div>
