<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		variant?: 'form' | 'centered';
		class?: string;
		children: Snippet;
	};

	let { variant = 'form', class: className = '', children }: Props = $props();

	const cardClass = $derived(
		variant === 'centered'
			? 'items-center rounded-lg bg-white dark:bg-slate-800'
			: 'items-start rounded-xl bg-gray-50 dark:bg-slate-800'
	);
</script>

<div
	class="flex w-full max-w-[440px] flex-col gap-2.5 border border-gray-200 px-5 pt-4 pb-5 shadow-[0_1px_1.5px_rgba(0,0,0,0.06)] sm:gap-3 sm:px-8 sm:py-6 dark:border-slate-700 dark:shadow-none {cardClass} {className}"
>
	<div class="flex h-9 w-full items-center gap-3 sm:h-8">
		<a href="/" class="font-syne text-[20px] font-extrabold leading-none sm:text-[22px]">
			<span class="text-gray-900 dark:text-slate-100">load</span><span class="text-brand">r</span>
		</a>
		<div class="flex-1" aria-hidden="true"></div>
		<a
			href="/"
			class="grid size-9 shrink-0 place-items-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 sm:size-8 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-700"
			aria-label="Back to home"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 14 14"
				fill="none"
				aria-hidden="true"
				class="size-4 sm:size-3.5"
			>
				<path
					d="M1 1l12 12M13 1L1 13"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
		</a>
	</div>
	{@render children()}
</div>
