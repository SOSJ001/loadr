<script lang="ts">
	import Skeleton from '$lib/components/ui/Skeleton.svelte';

	type Props = {
		delay?: number;
	};

	let { delay = 0 }: Props = $props();
</script>

<div
	class="rounded-xl border border-gray-200 bg-gray-50 px-6 py-5 dark:border-slate-700 dark:bg-slate-800"
	aria-hidden="true"
>
	<div class="flex items-start justify-between gap-4">
		<Skeleton class="h-3 w-[72px]" rounded="xs" delay={delay} />
		<Skeleton class="size-5 shrink-0" rounded="sm" delay={delay} />
	</div>
	<Skeleton class="mt-4 h-8 w-12 rounded-md" delay={delay} />
	<Skeleton class="mt-4 h-2.5 w-[110px]" rounded="xs" delay={delay} />
</div>
