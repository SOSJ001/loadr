<script lang="ts">
	type Props = {
		used: number;
		limit: number;
	};

	let { used, limit }: Props = $props();
</script>

<div
	class="flex flex-col gap-3 rounded-[10px] border border-green-200 bg-green-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-green-600 dark:bg-green-900"
>
	<div class="flex items-center gap-2.5">
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			class="shrink-0 text-brand"
			aria-hidden="true"
		>
			<path
				d="M2 12.5v-1.75A2.25 2.25 0 0 1 4.25 8.5h7.5A2.25 2.25 0 0 1 14 10.75v1.75M8 8.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">
			You're using
			<span class="font-semibold text-gray-900 dark:text-slate-100">
				{used} of {limit} driver slots
			</span>
			on the free plan
		</p>
	</div>
	<a
		href="/settings"
		class="font-inter text-[13px] font-medium text-brand transition-colors hover:text-[#178566]"
	>
		Upgrade for unlimited →
	</a>
</div>
