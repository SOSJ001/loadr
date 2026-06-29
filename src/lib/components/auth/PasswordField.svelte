<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		name?: string;
		label?: string;
		placeholder?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		value?: string;
		error?: string;
		forgotHref?: string | null;
		required?: boolean;
		labelClass?: string;
		oninput?: (event: Event & { currentTarget: HTMLInputElement }) => void;
	};

	let {
		name = 'password',
		label = 'Password',
		placeholder = 'Enter your password',
		autocomplete = 'current-password',
		value = $bindable(''),
		error = '',
		forgotHref = '/forgot-password',
		required = false,
		labelClass = '',
		oninput
	}: Props = $props();

	let showPassword = $state(false);

	const inputClass = $derived(
		error
			? 'border-red-600 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)] dark:border-red-500 dark:focus:border-red-500 dark:focus:shadow-[0_0_0_3px_rgba(248,113,113,0.2)]'
			: 'border-gray-200 focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,158,117,0.15)] dark:border-slate-700 dark:focus:border-brand dark:focus:shadow-[0_0_0_3px_rgba(29,158,117,0.25)]'
	);
</script>

<div class="flex w-full flex-col gap-1.5">
	<div class="flex items-center justify-between">
		<label
			for={name}
			class="font-inter text-xs font-medium text-gray-500 dark:text-slate-400 {labelClass}"
			>{label}</label
		>
		{#if forgotHref}
			<a href={forgotHref} class="font-inter text-xs font-medium text-brand hover:underline">
				Forgot password?
			</a>
		{/if}
	</div>
	<div class="relative">
		<input
			id={name}
			{name}
			type={showPassword ? 'text' : 'password'}
			{placeholder}
			{required}
			{autocomplete}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${name}-error` : undefined}
			bind:value
			{oninput}
			class="font-inter h-12 min-h-12 w-full rounded-lg border bg-white py-0 pr-11 pl-3.5 text-sm text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-gray-300 focus:border-2 focus:ring-0 sm:h-11 sm:min-h-11 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 {inputClass}"
		/>
		<button
			type="button"
			class="absolute top-1/2 right-3.5 -translate-y-1/2 rounded text-gray-400 outline-none hover:text-gray-600 focus-visible:text-gray-600 focus-visible:ring-2 focus-visible:ring-brand/15 dark:text-slate-500 dark:hover:text-slate-300 dark:focus-visible:text-slate-300"
			aria-label={showPassword ? 'Hide password' : 'Show password'}
			onclick={() => (showPassword = !showPassword)}
		>
			{#if showPassword}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			{/if}
		</button>
	</div>
	{#if error}
		<p id="{name}-error" class="font-inter text-xs text-red-600 dark:text-red-500">{error}</p>
	{/if}
</div>
