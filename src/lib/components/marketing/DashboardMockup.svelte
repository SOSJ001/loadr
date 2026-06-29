<script lang="ts">
	type Props = {
		variant?: 'hero' | 'showcase';
	};

	let { variant = 'hero' }: Props = $props();

	const imageLight = $derived(
		variant === 'showcase'
			? '/images/marketing/operator-dashboard-showcase-light.png'
			: '/images/marketing/operator-dashboard-light.png'
	);
	const imageDark = $derived(
		variant === 'showcase'
			? '/images/marketing/operator-dashboard-showcase-dark.png'
			: '/images/marketing/operator-dashboard-dark.png'
	);
	const mobileImageLight = '/images/marketing/operator-dashboard-showcase-mobile-light.png';
	const mobileImageDark = '/images/marketing/operator-dashboard-showcase-mobile-dark.png';

	const imageWidth = $derived(variant === 'showcase' ? 1800 : 2000);
	const imageHeight = $derived(variant === 'showcase' ? 1040 : 1048);
	const mobileImageWidth = 1992;
	const mobileImageHeight = 1152;

	const alt =
		'Loadr operator dashboard showing active jobs, drivers, and delivery status';
</script>

{#if variant === 'showcase'}
	<!-- Mobile: flat screenshot card (1C: Landing → For Operators) -->
	<div
		class="w-full max-w-[350px] overflow-hidden rounded-xl border border-gray-200 shadow-[0_16px_16px_rgba(0,0,0,0.12)] lg:hidden dark:border-slate-700 dark:shadow-[0_16px_16px_rgba(0,0,0,0.35)]"
	>
		<div class="relative h-[215px] w-full overflow-hidden">
			<img
				src={mobileImageLight}
				{alt}
				class="absolute inset-0 size-full object-cover object-top dark:hidden"
				width={mobileImageWidth}
				height={mobileImageHeight}
				loading="lazy"
				decoding="async"
			/>
			<img
				src={mobileImageDark}
				{alt}
				class="absolute inset-0 hidden size-full object-cover object-top dark:block"
				width={mobileImageWidth}
				height={mobileImageHeight}
				loading="lazy"
				decoding="async"
			/>
		</div>
	</div>

	<!-- Desktop: browser mockup with chrome -->
	<div
		class="hidden w-full max-w-[900px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_24px_48px_rgba(0,0,0,0.12)] lg:block dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
	>
		<div
			class="flex h-8 items-center gap-2 border-b border-gray-200 bg-white px-3.5 dark:border-slate-700 dark:bg-slate-800"
		>
			<span class="size-2 rounded-full bg-red-400"></span>
			<span class="size-2 rounded-full bg-yellow-400"></span>
			<span class="size-2 rounded-full bg-green-400"></span>
		</div>
		<div class="relative h-[520px] w-full overflow-hidden bg-gray-200 dark:bg-slate-900">
			<img
				src={imageLight}
				{alt}
				class="absolute inset-0 size-full object-cover object-top dark:hidden"
				width={imageWidth}
				height={imageHeight}
				loading="lazy"
				decoding="async"
			/>
			<img
				src={imageDark}
				{alt}
				class="absolute inset-0 hidden size-full object-cover object-top dark:block"
				width={imageWidth}
				height={imageHeight}
				loading="lazy"
				decoding="async"
			/>
		</div>
	</div>
{:else}
	<!-- Mobile: flat screenshot card (1C: Landing hero) -->
	<div
		class="w-full max-w-[350px] overflow-hidden rounded-xl border border-gray-200 shadow-[0_16px_16px_rgba(0,0,0,0.12)] lg:hidden dark:border-slate-700 dark:shadow-[0_16px_16px_rgba(0,0,0,0.35)]"
	>
		<div class="relative aspect-[2000/1048] w-full overflow-hidden">
			<img
				src={imageLight}
				{alt}
				class="absolute inset-0 size-full object-cover object-top dark:hidden"
				width={imageWidth}
				height={imageHeight}
				loading="eager"
				decoding="async"
			/>
			<img
				src={imageDark}
				{alt}
				class="absolute inset-0 hidden size-full object-cover object-top dark:block"
				width={imageWidth}
				height={imageHeight}
				loading="eager"
				decoding="async"
			/>
		</div>
	</div>

	<!-- Desktop: browser mockup with chrome -->
	<div
		class="hidden w-full max-w-[1000px] overflow-hidden rounded-xl bg-gray-50 shadow-[0_24px_48px_rgba(0,0,0,0.12)] lg:block dark:bg-slate-800 dark:shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
	>
		<div
			class="flex h-9 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800"
		>
			<span class="size-2.5 rounded-full bg-red-400"></span>
			<span class="size-2.5 rounded-full bg-yellow-400"></span>
			<span class="size-2.5 rounded-full bg-green-400"></span>
		</div>
		<div class="relative aspect-[2000/1048] w-full overflow-hidden bg-gray-200 dark:bg-slate-900">
			<img
				src={imageLight}
				{alt}
				class="absolute inset-0 size-full object-cover object-top dark:hidden"
				width={imageWidth}
				height={imageHeight}
				loading="eager"
				decoding="async"
			/>
			<img
				src={imageDark}
				{alt}
				class="absolute inset-0 hidden size-full object-cover object-top dark:block"
				width={imageWidth}
				height={imageHeight}
				loading="eager"
				decoding="async"
			/>
		</div>
	</div>
{/if}
