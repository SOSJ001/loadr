<script lang="ts">
	type Props = {
		limit: number;
	};

	let { limit }: Props = $props();
</script>

<div
	class="flex flex-col gap-3 rounded-[10px] border border-amber-300 bg-amber-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-amber-800 dark:bg-amber-950/40"
>
	<div class="flex items-center gap-2.5">
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			class="shrink-0 text-amber-600 dark:text-amber-400"
			aria-hidden="true"
		>
			<path
				d="M10 7v4.5M10 14.25h.008"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
			/>
			<path
				d="M3.6 16.25h12.8L10 3.75 3.6 16.25Z"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linejoin="round"
			/>
		</svg>
		<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">
			You've reached the
			<span class="font-semibold text-gray-900 dark:text-slate-100">
				{limit} driver limit
			</span>
			on the free plan
		</p>
	</div>
	<a
		href="/settings"
		class="inline-flex h-8 items-center justify-center rounded-lg bg-brand px-3 font-syne text-xs font-bold text-white transition-colors hover:bg-[#178566]"
	>
		Upgrade now
	</a>
</div>
