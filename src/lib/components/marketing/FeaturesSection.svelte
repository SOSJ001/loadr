<script lang="ts">
	import FeatureCard from '$lib/components/marketing/FeatureCard.svelte';
	import RevealOnScroll from '$lib/components/marketing/RevealOnScroll.svelte';
</script>

<section class="bg-white px-5 py-16 lg:px-8 lg:py-20 dark:bg-slate-900">
	<div class="mx-auto flex max-w-[1100px] flex-col items-center gap-8 lg:gap-14">
		<RevealOnScroll class="text-center">
			<h2
				class="font-syne text-[28px] font-bold text-gray-900 lg:text-[32px] dark:text-slate-100"
			>
				Everything you need to run your fleet
			</h2>
			<p class="mt-3 font-inter text-base text-gray-500 dark:text-slate-400">
				No more whiteboards, spreadsheets, or WhatsApp groups.
			</p>
		</RevealOnScroll>

		<div class="grid w-full gap-6 lg:grid-cols-3">
			<RevealOnScroll delay={0}>
				<FeatureCard
					icon="clipboard"
					title="Manage every job"
					description="Create jobs, assign drivers, and see your whole operation in one dashboard, replacing the whiteboard for good."
				/>
			</RevealOnScroll>
			<RevealOnScroll delay={120}>
				<FeatureCard
					icon="shield"
					title="Tamper-proof proof of delivery"
					description="Photo or signature capture, automatically saved and cryptographically timestamped. Win disputes instantly."
				/>
			</RevealOnScroll>
			<RevealOnScroll delay={240}>
				<FeatureCard
					icon="smartphone"
					title="Built for drivers on the road"
					description="A simple mobile app that works even on poor signal; updates sync automatically the moment connection returns."
				/>
			</RevealOnScroll>
		</div>
	</div>
</section>
