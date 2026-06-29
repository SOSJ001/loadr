<script lang="ts">
	import { AlertCircle } from '@lucide/svelte';

	type Props = {
		reason: string;
	};

	let { reason }: Props = $props();
</script>

<div
	class="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-5 pt-4 pb-[34px] dark:border-slate-700 dark:bg-slate-900"
>
	<div
		class="mx-auto flex w-full max-w-[390px] flex-col items-center gap-1 rounded-[10px] border border-red-200 bg-red-50 py-3.5 dark:border-[#7f1d1d] dark:bg-[#450a0a]"
		role="status"
	>
		<div class="flex items-center gap-2">
			<AlertCircle size={20} class="text-red-600" stroke-width={2} aria-hidden="true" />
			<p class="font-syne text-[15px] font-bold text-red-600">Delivery attempted</p>
		</div>
		<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">{reason}</p>
	</div>
</div>
