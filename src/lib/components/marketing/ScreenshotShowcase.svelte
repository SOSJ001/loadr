<script lang="ts">
	import DashboardMockup from '$lib/components/marketing/DashboardMockup.svelte';
	import PhoneMockup from '$lib/components/marketing/PhoneMockup.svelte';
	import RevealOnScroll from '$lib/components/marketing/RevealOnScroll.svelte';
	import ShowcaseRow from '$lib/components/marketing/ShowcaseRow.svelte';
</script>

<section class="bg-gray-50 px-5 py-12 lg:px-8 lg:py-20 dark:bg-slate-800">
	<div class="mx-auto flex max-w-[1100px] flex-col gap-16 lg:gap-[88px]">
		<RevealOnScroll class="w-full">
			<ShowcaseRow
				eyebrow="FOR OPERATORS"
				title="See your whole fleet at a glance"
				description="One dashboard for every active job, driver, and delivery status, so you always know where things stand."
				linkLabel="Explore the dashboard →"
				linkHref="/login"
			>
				{#snippet mockup()}
					<DashboardMockup variant="showcase" />
				{/snippet}
			</ShowcaseRow>
		</RevealOnScroll>

		<RevealOnScroll delay={100} class="w-full">
			<ShowcaseRow
				eyebrow="FOR DRIVERS"
				title="A job management app drivers actually want to use"
				description="Clear job details, one-tap proof of delivery, and offline support, built for life on the road."
				linkLabel="Driver log in →"
				linkHref="/login/driver"
			>
				{#snippet mockup()}
					<PhoneMockup />
				{/snippet}
			</ShowcaseRow>
		</RevealOnScroll>
	</div>
</section>
