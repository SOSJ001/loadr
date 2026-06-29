<script lang="ts">
	import RevealOnScroll from '$lib/components/marketing/RevealOnScroll.svelte';
	import StatCard from '$lib/components/marketing/StatCard.svelte';
</script>

<section class="bg-gray-50 px-5 py-12 lg:px-8 lg:py-16 dark:bg-slate-800">
	<div class="mx-auto flex max-w-[1216px] flex-col gap-3 lg:grid lg:grid-cols-3 lg:gap-6">
		<RevealOnScroll delay={0} class="h-full">
			<StatCard value="40%" title="of return journeys" subtitle="run completely empty" />
		</RevealOnScroll>
		<RevealOnScroll delay={120} class="h-full">
			<StatCard value="£127bn" title="UK logistics market" subtitle="and growing every year" />
		</RevealOnScroll>
		<RevealOnScroll delay={240} class="h-full">
			<StatCard value="£0" title="to get started" subtitle="free forever for small fleets" />
		</RevealOnScroll>
	</div>
</section>
