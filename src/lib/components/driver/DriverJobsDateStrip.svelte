<script lang="ts">
	import type { DriverJobDatePill } from '$lib/types/driver-jobs';

	type Props = {
		selectedDateLabel: string;
		datePills: DriverJobDatePill[];
		selectedDate: string;
		onSelectDate?: (date: string) => void;
	};

	let { selectedDateLabel, datePills, selectedDate, onSelectDate }: Props = $props();
</script>

<div class="flex flex-col gap-2.5 px-5">
	<p class="font-inter text-sm font-semibold text-gray-900 dark:text-slate-100">
		{selectedDateLabel}
	</p>

	<div class="date-pills-scroll -mx-5 overflow-x-auto px-5 pb-1">
		<div class="flex min-w-max gap-2">
			{#each datePills as pill (pill.date)}
				{@const isSelected = pill.date === selectedDate}
				<div class="relative pt-2">
					{#if onSelectDate}
						<button
							type="button"
							class="font-inter flex h-9 items-center justify-center rounded-full px-3.5 text-[13px] transition-colors {isSelected
								? 'bg-brand font-semibold text-white'
								: 'border border-gray-200 text-gray-500 dark:border-slate-600 dark:text-slate-400'}"
							onclick={() => onSelectDate(pill.date)}
						>
							{pill.label}
						</button>
					{:else}
						<div
							class="font-inter flex h-9 items-center justify-center rounded-full px-3.5 text-[13px] {isSelected
								? 'bg-brand font-semibold text-white'
								: 'border border-gray-200 text-gray-500 dark:border-slate-600 dark:text-slate-400'}"
						>
							{pill.label}
						</div>
					{/if}
					{#if pill.job_count > 0}
						<span
							class="font-inter absolute top-0 right-0 rounded-full px-1 py-px text-[9px] font-bold text-white {isSelected
								? 'bg-[#0f6e56]'
								: 'bg-gray-400 dark:bg-slate-600'}"
						>
							{pill.job_count}
						</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.date-pills-scroll {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.date-pills-scroll::-webkit-scrollbar {
		display: none;
	}
</style>
