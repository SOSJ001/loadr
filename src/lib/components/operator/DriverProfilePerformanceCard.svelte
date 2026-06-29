<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	type Performance = {
		on_time_rate: number;
		total_jobs_done: number;
		attempted_deliveries: number;
		avg_jobs_per_week: number;
		jobs_per_week: { label: string; value: number }[];
	};

	type Props = {
		locked?: boolean;
		performance?: Performance;
	};

	let { locked = false, performance }: Props = $props();

	const maxWeekValue = $derived(
		performance ? Math.max(...performance.jobs_per_week.map((week) => week.value), 1) : 1
	);

	function barHeight(value: number) {
		const minHeight = 12;
		const maxHeight = 60;
		return Math.round(minHeight + (value / maxWeekValue) * (maxHeight - minHeight));
	}
</script>

<section
	class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-slate-700 dark:bg-slate-800"
>
	<div class="flex items-center justify-between">
		<h2 class="font-syne text-base font-bold text-gray-900 dark:text-slate-100">Performance</h2>
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			class="text-gray-400 dark:text-slate-500"
			aria-hidden="true"
		>
			<path
				d="M2.5 12.5 6 6.5l3 2.5 4.5-7"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>

	{#if locked || !performance}
		<div class="flex flex-col items-center gap-1.5 py-6 text-center">
			<svg
				width="16"
				height="16"
				viewBox="0 0 12 12"
				fill="none"
				class="text-gray-500 dark:text-slate-400"
				aria-hidden="true"
			>
				<rect
					x="2.5"
					y="5"
					width="7"
					height="5"
					rx="1"
					stroke="currentColor"
					stroke-width="1.25"
				/>
				<path
					d="M4 5V3.75a2 2 0 0 1 4 0V5"
					stroke="currentColor"
					stroke-width="1.25"
					stroke-linecap="round"
				/>
			</svg>
			<p class="font-inter text-[15px] font-bold text-gray-500 dark:text-slate-400">
				Driver performance analytics
			</p>
			<p class="font-inter max-w-[220px] text-[13px] leading-relaxed text-gray-500 dark:text-slate-400">
				Upgrade to Pro to see on-time rates, job counts, and weekly trends
			</p>
			<Button href="/settings" variant="brand" class="mt-2 px-4 py-2 text-xs">
				Upgrade to Pro
			</Button>
		</div>
	{:else}
		<div class="grid min-w-0 grid-cols-2 gap-3">
			<div
				class="flex min-w-0 flex-col justify-center gap-1 rounded-[10px] border border-gray-200 bg-gray-100 px-3 py-3.5 dark:border-slate-700 dark:bg-slate-900"
			>
				<p class="font-inter text-[22px] font-bold text-green-600 dark:text-green-400">
					{performance.on_time_rate}%
				</p>
				<p class="font-inter text-[11px] leading-tight whitespace-nowrap text-gray-500 dark:text-slate-400">
					On-time rate
				</p>
			</div>
			<div
				class="flex min-w-0 flex-col justify-center gap-1 rounded-[10px] border border-gray-200 bg-gray-100 px-3 py-3.5 dark:border-slate-700 dark:bg-slate-900"
			>
				<p class="font-inter text-[22px] font-bold text-gray-900 dark:text-slate-100">
					{performance.total_jobs_done}
				</p>
				<p class="font-inter text-[11px] leading-tight whitespace-nowrap text-gray-500 dark:text-slate-400">
					Total jobs done
				</p>
			</div>
			<div
				class="flex min-w-0 flex-col justify-center gap-1 rounded-[10px] border border-gray-200 bg-gray-100 px-3 py-3.5 dark:border-slate-700 dark:bg-slate-900"
			>
				<p class="font-inter text-[22px] font-bold text-amber-600 dark:text-amber-400">
					{performance.attempted_deliveries}
				</p>
				<p class="font-inter text-[11px] leading-tight whitespace-nowrap text-gray-500 dark:text-slate-400">
					Attempted deliveries
				</p>
			</div>
			<div
				class="flex min-w-0 flex-col justify-center gap-1 rounded-[10px] border border-gray-200 bg-gray-100 px-3 py-3.5 dark:border-slate-700 dark:bg-slate-900"
			>
				<p class="font-inter text-[22px] font-bold text-gray-900 dark:text-slate-100">
					{performance.avg_jobs_per_week}
				</p>
				<p class="font-inter text-[11px] leading-tight whitespace-nowrap text-gray-500 dark:text-slate-400">
					Avg jobs per week
				</p>
			</div>
		</div>

		<p
			class="font-inter text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400"
		>
			Jobs per week — last 4 weeks
		</p>

		<div class="flex items-end justify-between gap-2" role="img" aria-label="Jobs per week chart">
			{#each performance.jobs_per_week as week (week.label)}
				<div class="flex flex-1 flex-col items-center gap-1">
					<div
						class="w-12 rounded-t bg-brand"
						style="height: {barHeight(week.value)}px"
						aria-hidden="true"
					></div>
					<span class="font-inter text-[11px] text-gray-500 dark:text-slate-400">{week.label}</span>
				</div>
			{/each}
		</div>
	{/if}
</section>
