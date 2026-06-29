<script lang="ts">
	import { setTheme, themeState } from '$lib/stores/theme.svelte';

	const isDark = $derived(themeState.value === 'dark');

	const pillClass = $derived(
		isDark
			? 'translate-x-[calc(100%+2px)] lg:translate-x-8'
			: 'translate-x-0'
	);
</script>

<div
	class="relative grid w-16 shrink-0 grid-cols-2 gap-0.5 rounded-full border p-[3px] lg:w-19 lg:gap-1 lg:p-1 {isDark
		? 'border-slate-700 bg-slate-800'
		: 'border-gray-200 bg-gray-100'}"
	role="group"
	aria-label="Theme"
>
	<div
		class="pointer-events-none absolute top-[3px] bottom-[3px] left-[3px] w-[26px] rounded-full transition-[transform,background-color,box-shadow] duration-500 motion-reduce:transition-none lg:top-1 lg:bottom-1 lg:left-1 lg:w-7 {pillClass} {isDark
			? 'bg-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.35)]'
			: 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]'}"
		aria-hidden="true"
	></div>

	<button
		type="button"
		class="relative z-10 flex size-[26px] cursor-pointer items-center justify-center rounded-full transition-all duration-500 motion-reduce:transition-none active:scale-90 lg:size-7 {isDark
			? 'scale-90 opacity-45'
			: 'scale-110 opacity-100'}"
		aria-label="Light mode"
		aria-pressed={!isDark}
		onclick={() => setTheme('light')}
	>
		<svg
			class="size-3.5 transition-transform duration-500 motion-reduce:transition-none lg:size-4 {isDark
				? 'rotate-0'
				: 'rotate-12'}"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				class={isDark ? 'stroke-slate-400' : 'stroke-amber-500'}
			/>
		</svg>
	</button>

	<button
		type="button"
		class="relative z-10 flex size-[26px] cursor-pointer items-center justify-center rounded-full transition-all duration-500 motion-reduce:transition-none active:scale-90 lg:size-7 {isDark
			? 'scale-110 opacity-100'
			: 'scale-90 opacity-45'}"
		aria-label="Dark mode"
		aria-pressed={isDark}
		onclick={() => setTheme('dark')}
	>
		<svg
			class="size-3.5 transition-transform duration-500 motion-reduce:transition-none lg:size-4 {isDark
				? '-rotate-12'
				: 'rotate-0'}"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				class={isDark ? 'stroke-slate-100' : 'stroke-gray-400'}
			/>
		</svg>
	</button>
</div>

<style>
	div[aria-hidden='true'] {
		transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@media (prefers-reduced-motion: reduce) {
		div[aria-hidden='true'] {
			transition-timing-function: ease;
		}
	}
</style>
