<script lang="ts">
	import { CircleCheck } from '@lucide/svelte';

	type Props = {
		timeLabel: string;
	};

	let { timeLabel }: Props = $props();
</script>

<div
	class="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-5 pt-4 pb-[34px] dark:border-slate-700 dark:bg-slate-900"
>
	<div
		class="mx-auto flex h-[52px] w-full max-w-[390px] items-center justify-center gap-2 rounded-[10px] border border-green-600 bg-green-100 dark:border-[#16a34a] dark:bg-[#14532d]"
		role="status"
	>
		<CircleCheck size={20} class="text-green-600 dark:text-[#16a34a]" stroke-width={2} aria-hidden="true" />
		<p class="font-syne text-[15px] font-bold text-green-600 dark:text-[#16a34a]">Job complete</p>
		<p class="font-inter text-sm text-gray-500 dark:text-slate-400">· {timeLabel}</p>
	</div>
</div>
