<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	type CtaVariant = 'outline-brand' | 'brand' | 'outline';

	type Props = {
		name: string;
		description: string;
		price: string;
		period: string;
		features: string[];
		ctaLabel: string;
		ctaHref: string;
		featured?: boolean;
		badge?: string;
		ctaVariant?: CtaVariant;
	};

	let {
		name,
		description,
		price,
		period,
		features,
		ctaLabel,
		ctaHref,
		featured = false,
		badge,
		ctaVariant = 'outline'
	}: Props = $props();

	const ctaClasses = $derived(
		{
			'outline-brand':
				'h-12 w-full rounded-lg border border-brand bg-white text-sm font-bold text-brand hover:bg-green-50 dark:border-brand dark:bg-transparent dark:text-brand dark:hover:bg-brand/10',
			brand: 'h-12 w-full rounded-lg text-sm font-bold',
			outline:
				'h-12 w-full rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-900 hover:bg-gray-50 dark:border-slate-600 dark:bg-transparent dark:text-slate-100 dark:hover:bg-slate-700/50'
		}[ctaVariant]
	);

	const buttonVariant = $derived(ctaVariant === 'brand' ? 'brand' : 'secondary');
</script>

<article
	class="mx-auto flex h-full w-full max-w-[350px] flex-col gap-3 rounded-[20px] border bg-white p-8 lg:max-w-none dark:border-slate-700 dark:bg-slate-800 {featured
		? 'border-2 border-brand shadow-[0_8px_24px_rgba(29,158,117,0.12)]'
		: 'border-gray-200'}"
>
	{#if badge}
		<span
			class="inline-flex w-fit rounded-full bg-brand px-3.5 py-1 text-[11px] font-semibold text-white"
		>
			{badge}
		</span>
	{/if}

	<h3 class="font-inter text-xl font-bold text-gray-900 dark:text-slate-100">{name}</h3>
	<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">{description}</p>

	<div class="text-center lg:text-left">
		<p
			class="font-syne text-[44px] font-extrabold leading-none text-gray-900 dark:text-slate-100"
		>
			{price}
		</p>
		<p class="font-inter text-sm text-gray-500 dark:text-slate-400">
			{period}
		</p>
	</div>

	<Button href={ctaHref} variant={buttonVariant} class={ctaClasses}>
		{ctaLabel}
	</Button>

	<div class="h-px bg-gray-200 dark:bg-slate-700"></div>

	<ul class="flex flex-col gap-3">
		{#each features as feature (feature)}
			<li class="flex items-center gap-2">
				<svg
					class="size-4 shrink-0"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="none"
					aria-hidden="true"
				>
					<circle cx="8" cy="8" r="8" class="fill-brand" />
					<path
						d="M5 8 7 10 11 6"
						stroke="white"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span class="min-w-0 flex-1 font-inter text-sm text-gray-900 dark:text-slate-100"
					>{feature}</span
				>
			</li>
		{/each}
	</ul>

	<div class="hidden min-h-0 flex-1 lg:block" aria-hidden="true"></div>
</article>
