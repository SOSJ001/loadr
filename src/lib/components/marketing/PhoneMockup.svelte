<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	type Slide = {
		label: string;
		light: string;
		dark: string;
	};

	const slides: Slide[] = [
		{
			label: 'My Jobs',
			light: '/images/marketing/driver-app-my-jobs-light.png',
			dark: '/images/marketing/driver-app-my-jobs-dark.png'
		},
		{
			label: 'Job Detail',
			light: '/images/marketing/driver-app-job-detail-light.png',
			dark: '/images/marketing/driver-app-job-detail-dark.png'
		}
	];

	const slideTransition = { duration: 280, easing: quintOut, opacity: 0 };

	let activeSlide = $state(0);
	let direction = $state(1);

	const active = $derived(slides[activeSlide] ?? slides[0]);

	function goTo(index: number, slideDirection: number) {
		const next = ((index % slides.length) + slides.length) % slides.length;
		if (next === activeSlide) return;
		direction = slideDirection;
		activeSlide = next;
	}

	function prev() {
		goTo(activeSlide - 1, -1);
	}

	function next() {
		goTo(activeSlide + 1, 1);
	}

	function goToDot(index: number) {
		if (index === activeSlide) return;
		goTo(index, index > activeSlide ? 1 : -1);
	}
</script>

{#snippet phoneBezel(size: 'desktop' | 'mobile', screen: import('svelte').Snippet)}
	<div
		class="overflow-hidden rounded-[36px] bg-gray-300 shadow-[0_16px_32px_rgba(0,0,0,0.12)] dark:bg-slate-600 dark:shadow-[0_16px_32px_rgba(0,0,0,0.35)] {size ===
		'desktop'
			? 'h-[513px] w-[250px] p-2.5'
			: 'h-[430px] w-[210px] p-2.5'}"
	>
		<div
			class="relative overflow-hidden rounded-[28px] bg-white dark:bg-slate-900 {size ===
			'desktop'
				? 'h-[485px] w-[230px]'
				: 'h-[402px] w-[190px]'}"
		>
			{@render screen()}
		</div>
	</div>
{/snippet}

{#snippet screenImages(light: string, dark: string, label: string)}
	<img
		src={light}
		alt="Loadr driver app: {label}"
		class="absolute inset-0 size-full object-cover object-top dark:hidden"
		loading="lazy"
		decoding="async"
	/>
	<img
		src={dark}
		alt="Loadr driver app: {label}"
		class="absolute inset-0 hidden size-full object-cover object-top dark:block"
		loading="lazy"
		decoding="async"
	/>
{/snippet}

<!-- Mobile: phone carousel (1C: Landing → For Drivers) -->
<div class="flex w-full max-w-[350px] flex-col items-center gap-4 lg:hidden">
	<div class="flex items-center justify-center gap-2.5">
		<button
			type="button"
			class="grid size-11 shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
			aria-label="Previous screen"
			onclick={prev}
		>
			<svg
				class="size-4"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
			>
				<path
					d="M15 18l-6-6 6-6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>

		<div class="shrink-0">
			{@render phoneBezel('mobile', mobileScreen)}
		</div>

		<button
			type="button"
			class="grid size-11 shrink-0 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
			aria-label="Next screen"
			onclick={next}
		>
			<svg
				class="size-4"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
			>
				<path
					d="M9 18l6-6-6-6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	</div>

	<div class="flex h-2 items-center gap-1.5" role="tablist" aria-label="Driver app screens">
		{#each slides as slide, index (slide.label)}
			<button
				type="button"
				role="tab"
				class="size-2 rounded-full transition-colors {index === activeSlide
					? 'bg-brand'
					: 'bg-gray-300 dark:bg-slate-600'}"
				aria-selected={index === activeSlide}
				aria-label={slide.label}
				onclick={() => goToDot(index)}
			></button>
		{/each}
	</div>

	<p
		class="w-full text-center font-inter text-[13px] font-medium text-gray-500 dark:text-slate-400"
		aria-live="polite"
	>
		{active.label}
	</p>
</div>

{#snippet mobileScreen()}
	{#key activeSlide}
		<div
			class="absolute inset-0"
			in:fly={{ ...slideTransition, x: direction * 48 }}
			out:fly={{ ...slideTransition, x: direction * -48 }}
		>
			{@render screenImages(active.light, active.dark, active.label)}
		</div>
	{/key}
{/snippet}

<!-- Desktop: two phones side by side -->
<div class="hidden flex-wrap items-start justify-center gap-20 lg:flex">
	{#each slides as slide (slide.label)}
		<div class="flex flex-col items-center gap-3">
			{#snippet desktopScreen()}
				{@render screenImages(slide.light, slide.dark, slide.label)}
			{/snippet}
			{@render phoneBezel('desktop', desktopScreen)}
			<p class="font-inter text-[13px] font-medium text-gray-500 dark:text-slate-400">
				{slide.label}
			</p>
		</div>
	{/each}
</div>
