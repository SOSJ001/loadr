<script lang="ts">
	import type { Snippet } from 'svelte';
	import OperatorSidebarSkeleton from '$lib/components/operator/skeleton/OperatorSidebarSkeleton.svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<div class="skeleton-surface flex h-dvh overflow-hidden bg-white dark:bg-slate-900">
	<OperatorSidebarSkeleton />

	<div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900">
		<main class="flex min-h-0 flex-1 flex-col overflow-hidden">
			<div class="flex min-h-0 flex-1 flex-col overflow-hidden">
				{@render children()}
			</div>
		</main>
	</div>
</div>
