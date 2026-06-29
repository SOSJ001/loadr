<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		eyebrow: string;
		title: string;
		description: string;
		linkLabel: string;
		linkHref: string;
		mockup: Snippet;
	};

	let { eyebrow, title, description, linkLabel, linkHref, mockup }: Props = $props();
</script>

<div class="flex w-full flex-col items-center gap-7 lg:gap-9">
	<div
		class="flex w-full max-w-[350px] flex-col items-center gap-3 text-center lg:max-w-[600px]"
	>
		<p class="text-xs font-semibold tracking-[0.72px] text-brand">{eyebrow}</p>
		<h3
			class="font-syne text-2xl font-bold leading-[1.2] text-gray-900 lg:text-[28px] dark:text-slate-100"
		>
			{title}
		</h3>
		<p class="font-inter text-[15px] leading-[1.6] text-gray-500 dark:text-slate-400">
			{description}
		</p>
		<a href={linkHref} class="font-inter text-sm font-medium text-brand hover:underline">
			{linkLabel}
		</a>
	</div>

	<div class="flex w-full justify-center px-0 lg:px-0">
		{@render mockup()}
	</div>
</div>
