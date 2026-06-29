<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		formaction?: string;
		variant?: 'primary' | 'secondary' | 'brand';
		size?: 'default' | 'auth';
		class?: string;
		disabled?: boolean;
		children: Snippet;
		onclick?: (event: MouseEvent) => void;
	};

	let {
		href,
		type = 'button',
		formaction,
		variant = 'primary',
		size = 'default',
		class: className = '',
		disabled = false,
		children,
		onclick
	}: Props = $props();

	const variantClasses = {
		primary: 'bg-gray-900 text-white hover:bg-gray-800',
		secondary:
			'border border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-700',
		brand: 'bg-brand text-white hover:bg-[#178566]'
	} as const;

	const sizeClasses = {
		default: 'h-11',
		auth: 'h-[52px] sm:h-11'
	} as const;

	const classes = $derived(
		`inline-flex items-center justify-center rounded-lg px-4 font-syne text-[13px] font-bold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-60 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`
	);
</script>

{#if href && !disabled}
	<a {href} class={classes} {onclick}>{@render children()}</a>
{:else}
	<button {type} {formaction} class={classes} {disabled} {onclick}>{@render children()}</button>
{/if}
