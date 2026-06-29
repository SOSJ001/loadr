<script lang="ts">
	import type { BillingPeriod } from '$lib/components/marketing/BillingToggle.svelte';
	import FinalCtaSection from '$lib/components/marketing/FinalCtaSection.svelte';
	import PricingCardsSection from '$lib/components/marketing/PricingCardsSection.svelte';
	import PricingFaqSection from '$lib/components/marketing/PricingFaqSection.svelte';
	import PricingHeroSection from '$lib/components/marketing/PricingHeroSection.svelte';

	let billingPeriod = $state<BillingPeriod>('monthly');
</script>

<PricingHeroSection bind:billingPeriod />
<PricingCardsSection {billingPeriod} />
<PricingFaqSection />
<FinalCtaSection />
