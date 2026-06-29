<script lang="ts">
	import type { BillingPeriod } from '$lib/components/marketing/BillingToggle.svelte';
	import PricingCard from '$lib/components/marketing/PricingCard.svelte';
	import RevealOnScroll from '$lib/components/marketing/RevealOnScroll.svelte';

	type Props = {
		billingPeriod: BillingPeriod;
	};

	let { billingPeriod }: Props = $props();

	const starterPrice = $derived(billingPeriod === 'monthly' ? '£29' : '£23');
	const starterPeriod = $derived(
		billingPeriod === 'monthly' ? '/month' : '/month, billed annually'
	);

	const proPrice = $derived(billingPeriod === 'monthly' ? '£49' : '£39');
	const proPeriod = $derived(billingPeriod === 'monthly' ? '/month' : '/month, billed annually');
</script>

<section class="bg-white px-5 py-4 lg:px-8 lg:py-12 dark:bg-transparent">
	<div
		class="mx-auto flex max-w-[1100px] flex-col items-center gap-4 lg:grid lg:grid-cols-3 lg:items-stretch lg:gap-6"
	>
		<RevealOnScroll delay={0} class="order-2 flex h-full w-full lg:order-1">
			<PricingCard
				name="Free"
				description="For small fleets getting started"
				price="£0"
				period="/forever"
				ctaLabel="Sign up free"
				ctaHref="/signup"
				ctaVariant="outline-brand"
				features={[
					'Up to 3 drivers',
					'20 jobs per month',
					'Job tracking & dashboard',
					'Photo & signature proof of delivery',
					'Blockchain-verified PoD receipts'
				]}
			/>
		</RevealOnScroll>

		<RevealOnScroll delay={120} class="order-1 flex h-full w-full lg:order-2">
			<PricingCard
				name="Starter"
				description="For fleets ready to grow"
				price={starterPrice}
				period={starterPeriod}
				badge="Most popular"
				featured
				ctaLabel="Start free trial"
				ctaHref="/signup"
				ctaVariant="brand"
				features={[
					'Unlimited drivers',
					'Unlimited jobs',
					'Analytics dashboard',
					'Invoice generation'
				]}
			/>
		</RevealOnScroll>

		<RevealOnScroll delay={240} class="order-3 flex h-full w-full lg:order-3">
			<PricingCard
				name="Pro"
				description="For fleets that need full control"
				price={proPrice}
				period={proPeriod}
				ctaLabel="Start free trial"
				ctaHref="/signup"
				ctaVariant="outline"
				features={[
					'Cost tracking & margins',
					'Multi-vehicle management',
					'CSV export',
					'Priority support'
				]}
			/>
		</RevealOnScroll>
	</div>
</section>
