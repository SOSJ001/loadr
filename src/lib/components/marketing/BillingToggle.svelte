<script lang="ts" module>
	export type BillingPeriod = 'monthly' | 'annual';
</script>

<script lang="ts">
	type Props = {
		value?: BillingPeriod;
	};

	let { value = $bindable('monthly' as BillingPeriod) }: Props = $props();
</script>

<div
	class="inline-flex max-w-full gap-1 rounded-full bg-gray-100 p-1 dark:bg-slate-800"
	role="group"
	aria-label="Billing period"
>
	<button
		type="button"
		class="cursor-pointer rounded-full px-4 py-2 text-[13px] transition-all duration-200 lg:text-sm {value ===
		'monthly'
			? 'bg-white font-semibold text-gray-900 shadow-sm dark:bg-slate-700 dark:text-slate-100 dark:shadow-[0_1px_3px_rgba(0,0,0,0.25)]'
			: 'font-medium text-gray-500 dark:text-slate-400'}"
		aria-pressed={value === 'monthly'}
		onclick={() => (value = 'monthly')}
	>
		Monthly
	</button>
	<button
		type="button"
		class="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-[13px] transition-all duration-200 lg:px-4 lg:text-sm {value ===
		'annual'
			? 'bg-white font-semibold text-gray-900 shadow-sm dark:bg-slate-700 dark:text-slate-100 dark:shadow-[0_1px_3px_rgba(0,0,0,0.25)]'
			: 'font-medium text-gray-500 dark:text-slate-400'}"
		aria-pressed={value === 'annual'}
		onclick={() => (value = 'annual')}
	>
		<span class="lg:hidden">Annual</span>
		<span class="hidden lg:inline">Annual (save 20%)</span>
		{#if value !== 'annual'}
			<span class="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-600">
				Save 20%
			</span>
		{/if}
	</button>
</div>
