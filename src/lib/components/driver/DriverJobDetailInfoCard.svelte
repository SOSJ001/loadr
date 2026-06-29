<script lang="ts">
	import { Calendar, Clock, FileText, Info, Truck } from '@lucide/svelte';

	type Props = {
		scheduledDateLabel: string;
		scheduledTimeLabel: string;
		vehicleLabel: string | null;
		notes: string | null;
	};

	let { scheduledDateLabel, scheduledTimeLabel, vehicleLabel, notes }: Props = $props();
</script>

<section
	class="flex w-full flex-col gap-3.5 rounded-[14px] border border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-slate-800"
>
	<div class="flex items-center justify-between">
		<h2 class="font-syne text-[15px] font-bold text-gray-900 dark:text-slate-100">Job Details</h2>
		<Info size={16} class="text-gray-400 dark:text-slate-400" stroke-width={1.75} aria-hidden="true" />
	</div>

	<div class="flex flex-col gap-3.5">
		<div class="flex items-center justify-between gap-3">
			<div class="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
				<Calendar size={15} stroke-width={1.75} aria-hidden="true" />
				<span class="font-inter text-[13px]">Date</span>
			</div>
			<p class="font-inter text-sm font-semibold text-gray-900 dark:text-slate-100">{scheduledDateLabel}</p>
		</div>

		<div class="flex items-center justify-between gap-3">
			<div class="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
				<Clock size={15} stroke-width={1.75} aria-hidden="true" />
				<span class="font-inter text-[13px]">Time</span>
			</div>
			<p class="font-inter text-sm font-semibold text-gray-900 dark:text-slate-100">{scheduledTimeLabel}</p>
		</div>

		{#if vehicleLabel}
			<div class="flex items-center justify-between gap-3">
				<div class="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
					<Truck size={15} stroke-width={1.75} aria-hidden="true" />
					<span class="font-inter text-[13px]">Vehicle</span>
				</div>
				<p class="font-inter text-sm font-semibold text-gray-900 dark:text-slate-100">{vehicleLabel}</p>
			</div>
		{/if}

		{#if notes}
			<div class="flex flex-col gap-2">
				<div class="flex items-center gap-1.5 text-amber-600">
					<FileText size={15} stroke-width={1.75} aria-hidden="true" />
					<span class="font-inter text-[13px] font-medium">Notes</span>
				</div>
				<div class="rounded-lg bg-amber-100 p-3 dark:bg-stone-800">
					<p class="font-inter text-sm leading-[21px] text-amber-600 dark:text-amber-300">{notes}</p>
				</div>
			</div>
		{/if}
	</div>
</section>
