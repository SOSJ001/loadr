<script lang="ts">
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import { skeletonStagger } from '$lib/utils/skeleton-motion';

	type Props = {
		/** Stagger index offset for the table section (after stat cards). */
		sectionIndex?: number;
	};

	let { sectionIndex = 4 }: Props = $props();

	const rowCount = 5;
	const headerDelay = $derived(skeletonStagger(sectionIndex));
</script>

<section aria-hidden="true" aria-busy="true">
	<div class="mb-4 flex items-center justify-between gap-4">
		<Skeleton class="h-4 w-[100px] rounded" delay={headerDelay} />
		<Skeleton class="h-3 w-[88px]" rounded="xs" delay={headerDelay} />
	</div>

	<div
		class="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800"
	>
		<div
			class="border-b border-gray-200 bg-gray-100 px-5 py-3.5 dark:border-slate-700 dark:bg-slate-900"
		>
			<div class="flex min-w-[920px] items-center gap-8">
				<Skeleton class="h-3 w-[50px]" rounded="xs" delay={headerDelay} />
				<Skeleton class="h-3 w-[60px]" rounded="xs" delay={headerDelay} />
				<Skeleton class="ml-16 h-3 w-[60px]" rounded="xs" delay={headerDelay} />
				<Skeleton class="ml-24 h-3 w-20" rounded="xs" delay={headerDelay} />
				<Skeleton class="ml-8 h-3 w-14" rounded="xs" delay={headerDelay} />
				<Skeleton class="ml-8 h-3 w-9" rounded="xs" delay={headerDelay} />
				<Skeleton class="ml-auto h-3 w-10" rounded="xs" delay={headerDelay} />
			</div>
		</div>

		{#each Array.from({ length: rowCount }) as _, index (index)}
			{@const rowDelay = skeletonStagger(sectionIndex + 1 + index)}
			<div
				class="flex min-w-[920px] items-center gap-3 border-b border-gray-200 px-5 py-3.5 last:border-b-0 dark:border-slate-700 {index %
					2 ===
				0
					? 'bg-gray-50 dark:bg-slate-800'
					: 'bg-white dark:bg-slate-900'}"
			>
				<Skeleton class="size-4 shrink-0" rounded="sm" delay={rowDelay} />
				<Skeleton class="h-3 w-10 shrink-0" rounded="xs" delay={rowDelay} />
				<div class="w-[180px] shrink-0 space-y-1.5">
					<Skeleton class="h-3 w-[100px]" rounded="xs" delay={rowDelay} />
					<Skeleton class="h-2.5 w-16" rounded="xs" delay={rowDelay} />
				</div>
				<div class="w-[180px] shrink-0 space-y-1.5">
					<Skeleton class="h-3 w-[100px]" rounded="xs" delay={rowDelay} />
					<Skeleton class="h-2.5 w-16" rounded="xs" delay={rowDelay} />
				</div>
				<div class="flex w-[140px] shrink-0 items-center gap-2">
					<Skeleton class="size-7 shrink-0" rounded="full" delay={rowDelay} />
					<Skeleton class="h-3 w-[72px]" rounded="xs" delay={rowDelay} />
				</div>
				<Skeleton class="h-6 w-[72px] shrink-0 rounded-full" delay={rowDelay} />
				<Skeleton class="h-3 w-12 shrink-0" rounded="xs" delay={rowDelay} />
				<Skeleton class="ml-auto h-4 w-14 shrink-0" rounded="xs" delay={rowDelay} />
			</div>
		{/each}
	</div>
</section>
