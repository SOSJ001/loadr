<script lang="ts">
	import { jobDetailCardClass } from '$lib/components/operator/job-detail-ui';
	import Button from '$lib/components/ui/Button.svelte';
	import type { OperatorJobCostData } from '$lib/types/operator-job-detail';
	import { formatJobDetailCurrency } from '$lib/utils/operator-job-detail';
	import { DollarSign, Lock, Pencil } from '@lucide/svelte';

	type Props = {
		cost: OperatorJobCostData | null;
	};

	let { cost }: Props = $props();

	const cardClass = jobDetailCardClass;
</script>

<section class={cardClass}>
	<div class="flex items-center justify-between">
		<h2 class="font-syne text-base font-bold text-gray-900 dark:text-slate-100">Job Cost</h2>
		<DollarSign size={18} class="text-brand" aria-hidden="true" />
	</div>

	{#if cost}
		<div class="mt-4 space-y-3">
			<div class="flex items-center justify-between gap-4">
				<span class="font-inter text-[13px] text-gray-500 dark:text-slate-400">Fuel cost</span>
				<span class="flex items-center gap-1 font-inter text-sm font-semibold text-gray-900 dark:text-slate-100">
					{formatJobDetailCurrency(cost.fuel_cost)}
					<Pencil size={16} class="text-gray-400 dark:text-slate-500" aria-hidden="true" />
				</span>
			</div>
			<div class="flex items-center justify-between gap-4">
				<span class="font-inter text-[13px] text-gray-500 dark:text-slate-400">Job value</span>
				<span class="flex items-center gap-1 font-inter text-sm font-semibold text-gray-900 dark:text-slate-100">
					{formatJobDetailCurrency(cost.job_value)}
					<Pencil size={16} class="text-gray-400 dark:text-slate-500" aria-hidden="true" />
				</span>
			</div>
		</div>

		<div class="my-4 h-px bg-gray-200 dark:bg-slate-700"></div>

		<div class="flex items-center justify-between gap-4">
			<span class="font-inter text-[13px] font-medium text-gray-900 dark:text-slate-100">Margin</span>
			<span class="font-inter text-base font-bold text-green-600 dark:text-green-500">
				{formatJobDetailCurrency(cost.margin)}
			</span>
		</div>
		<p class="font-inter text-xs text-green-600 dark:text-green-500">
			{cost.margin_percent}% margin on this job
		</p>
	{:else}
		<div
			class="mt-4 flex h-[150px] flex-col items-center justify-center gap-2 rounded-lg bg-gray-50/90 dark:bg-slate-900/60"
		>
			<Lock size={16} class="text-gray-500 dark:text-slate-400" aria-hidden="true" />
			<p class="font-inter text-sm font-medium text-gray-500 dark:text-slate-400">
				Upgrade to track costs
			</p>
			<Button href="/settings" variant="brand" class="px-4 py-2 text-xs">
				Upgrade plan
			</Button>
		</div>
	{/if}
</section>
