<script lang="ts">
	import BillingToggle, { type BillingPeriod } from '$lib/components/marketing/BillingToggle.svelte';

	let { billingPeriod = $bindable('monthly' as BillingPeriod) }: { billingPeriod?: BillingPeriod } =
		$props();
</script>

<section
	class="flex flex-col items-center gap-3 bg-white px-5 pb-8 pt-12 text-center lg:px-8 lg:pb-12 lg:pt-16 dark:bg-transparent"
>
	<h1
		class="max-w-[350px] font-syne text-[28px] font-extrabold text-gray-900 lg:max-w-none lg:text-[40px] dark:text-slate-100"
	>
		Simple pricing for growing fleets
	</h1>
	<p
		class="max-w-[350px] font-syne text-base font-bold text-gray-500 lg:max-w-none dark:text-slate-400"
	>
		Start free. Upgrade when you're ready to scale.
	</p>
	<div class="mt-2 lg:mt-5">
		<BillingToggle bind:value={billingPeriod} />
	</div>
</section>
