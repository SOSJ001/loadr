<script lang="ts" module>
	export type LegalSection = {
		id: string;
		title: string;
		body: string;
		callout?: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import LegalCallout from '$lib/components/marketing/LegalCallout.svelte';
	import LegalJumpToSection from '$lib/components/marketing/LegalJumpToSection.svelte';
	import LegalToc from '$lib/components/marketing/LegalToc.svelte';

	type Props = {
		title: string;
		lastUpdated: string;
		sections: LegalSection[];
	};

	let { title, lastUpdated, sections }: Props = $props();

	let activeId = $state<string | null>(null);

	const tocItems = $derived(sections.map(({ id, title: label }) => ({ id, label })));

	onMount(() => {
		activeId = sections[0]?.id ?? null;

		const hash = window.location.hash.slice(1);
		if (hash && sections.some((section) => section.id === hash)) {
			activeId = hash;
		}

		const sectionElements = sections
			.map((section) => document.getElementById(section.id))
			.filter((element): element is HTMLElement => element !== null);

		if (sectionElements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);

				const nextId = visible[0]?.target.id;
				if (nextId) {
					activeId = nextId;
				}
			},
			{ rootMargin: '-10% 0px -55% 0px', threshold: [0, 0.1, 0.5, 1] }
		);

		for (const element of sectionElements) {
			observer.observe(element);
		}

		return () => observer.disconnect();
	});
</script>

<section class="bg-white px-5 pb-12 pt-6 lg:px-8 lg:pb-20 lg:pt-12 dark:bg-transparent">
	<div class="mx-auto flex max-w-[1200px] flex-col lg:flex-row lg:gap-12">
		<aside class="hidden lg:sticky lg:top-24 lg:block lg:w-60 lg:shrink-0">
			<LegalToc items={tocItems} {activeId} />
		</aside>

		<article class="mx-auto min-w-0 w-full max-w-[350px] flex-1 lg:mx-0 lg:max-w-[700px]">
			<div class="flex flex-col gap-2 lg:gap-4">
				<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">
					Last updated: {lastUpdated}
				</p>
				<h1
					class="font-syne text-2xl font-extrabold leading-[1.15] text-gray-900 lg:text-[36px] dark:text-slate-100"
				>
					{title}
				</h1>
			</div>

			<div class="mt-5">
				<LegalJumpToSection items={tocItems} {activeId} />
			</div>

			<div class="flex flex-col lg:mt-4 lg:gap-4">
				{#each sections as section (section.id)}
					<section
						id={section.id}
						class="scroll-mt-24 flex flex-col gap-3 pt-6 lg:gap-4 lg:pt-0"
					>
						<h2
							class="font-inter text-xl font-bold text-gray-900 lg:text-[22px] dark:text-slate-100"
						>
							{section.title}
						</h2>
						{#if section.callout}
							<LegalCallout>{section.callout}</LegalCallout>
						{/if}
						<p
							class="font-inter text-[15px] leading-[1.7] text-gray-500 dark:text-slate-400"
						>
							{section.body}
						</p>
					</section>
				{/each}
			</div>
		</article>
	</div>
</section>
