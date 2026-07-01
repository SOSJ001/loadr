<script lang="ts">
	import OperatorPageContent from '$lib/components/operator/OperatorPageContent.svelte';
	import DashboardRecentJobsSkeleton from '$lib/components/operator/skeleton/DashboardRecentJobsSkeleton.svelte';
	import DashboardStatCardSkeleton from '$lib/components/operator/skeleton/DashboardStatCardSkeleton.svelte';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import { skeletonStagger } from '$lib/utils/skeleton-motion';
</script>

<div class="skeleton-surface flex min-h-0 flex-1 flex-col overflow-hidden">
	<header
		class="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-900"
		aria-busy="true"
		aria-label="Loading dashboard"
	>
		<Skeleton class="h-[22px] w-[120px] rounded-md" delay={skeletonStagger(0)} />
		<div class="flex items-center gap-3">
			<Skeleton class="h-9 w-11 rounded-lg" delay={skeletonStagger(1)} />
			<Skeleton class="h-9 w-[120px] rounded-lg" brand delay={skeletonStagger(2)} />
		</div>
	</header>

	<OperatorPageContent class="gap-6">
		<div class="grid gap-4 sm:grid-cols-3">
			<DashboardStatCardSkeleton delay={skeletonStagger(3)} />
			<DashboardStatCardSkeleton delay={skeletonStagger(4)} />
			<DashboardStatCardSkeleton delay={skeletonStagger(5)} />
		</div>

		<DashboardRecentJobsSkeleton sectionIndex={6} />
	</OperatorPageContent>
</div>
