<script lang="ts">
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import { skeletonStagger } from '$lib/utils/skeleton-motion';

	type NavRow = {
		active?: boolean;
		labelWidth: string;
		locked?: boolean;
	};

	const navRows: NavRow[] = [
		{ active: true, labelWidth: 'w-[74px]' },
		{ labelWidth: 'w-[31px]' },
		{ labelWidth: 'w-[49px]' },
		{ labelWidth: 'w-[58px]', locked: true },
		{ labelWidth: 'w-[62px]', locked: true },
		{ labelWidth: 'w-[57px]', locked: true }
	];
</script>

<aside
	class="skeleton-surface flex h-full w-60 shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white px-3 pt-6 pb-4 dark:border-slate-700 dark:bg-slate-900"
	aria-hidden="true"
>
	<div class="pl-2">
		<Skeleton class="h-5 w-[62px] rounded" delay={skeletonStagger(0)} />
	</div>

	<nav class="mt-8 flex flex-col gap-1">
		{#each navRows as row, index (index)}
			{@const rowDelay = skeletonStagger(index + 1)}
			<div
				class="relative flex h-11 items-center gap-3 rounded-lg px-4 {row.active
					? 'bg-green-50 dark:bg-green-950/40'
					: ''}"
			>
				{#if row.active}
					<div
						class="absolute top-0 left-0 h-11 w-1 rounded-sm bg-green-600 dark:bg-brand"
						aria-hidden="true"
					></div>
				{/if}
				<Skeleton class="size-4 shrink-0" rounded="xs" delay={rowDelay} />
				<Skeleton class="h-3 {row.labelWidth}" rounded="xs" delay={rowDelay} />
				{#if row.locked}
					<Skeleton class="ml-auto size-[13px] shrink-0" rounded="xs" delay={rowDelay} />
				{/if}
			</div>
		{/each}

		<div class="h-3" aria-hidden="true"></div>
		<div class="h-px bg-gray-200 dark:bg-slate-700"></div>
		<div class="h-3" aria-hidden="true"></div>

		<div class="flex h-11 items-center gap-3 rounded-lg px-4">
			<Skeleton class="size-4 shrink-0" rounded="xs" delay={skeletonStagger(7)} />
			<Skeleton class="h-3 w-[52px]" rounded="xs" delay={skeletonStagger(7)} />
		</div>
		<div class="flex h-11 items-center gap-3 rounded-lg px-4">
			<Skeleton class="size-4 shrink-0" rounded="xs" delay={skeletonStagger(8)} />
			<Skeleton class="h-3 w-12" rounded="xs" delay={skeletonStagger(8)} />
		</div>
	</nav>

	<div class="flex-1" aria-hidden="true"></div>

	<div class="flex items-center gap-2.5 px-4 py-3">
		<Skeleton class="size-8 shrink-0" rounded="full" brand delay={skeletonStagger(9)} />
		<div class="min-w-0 space-y-2">
			<Skeleton class="h-[13px] w-[88px]" rounded="xs" delay={skeletonStagger(9)} />
			<Skeleton class="h-[14px] w-14" rounded="full" delay={skeletonStagger(10)} />
		</div>
	</div>
</aside>
