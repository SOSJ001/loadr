<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import RevealOnScroll from '$lib/components/marketing/RevealOnScroll.svelte';

	type FaqItem = {
		question: string;
		answer: string;
	};

	const faqs: FaqItem[] = [
		{
			question: 'Is the free plan really free forever?',
			answer:
				'Yes. The Free plan stays free for up to 3 drivers and 20 jobs per month, no time limit, no credit card required. You only pay if you choose to upgrade.'
		},
		{
			question: 'Can I switch plans at any time?',
			answer:
				'Absolutely. Upgrade or downgrade whenever you like from your account settings. Changes take effect immediately and billing is prorated through Stripe.'
		},
		{
			question: 'What happens to my data if I downgrade?',
			answer:
				'Your jobs, drivers, and proof of delivery records are kept. If you exceed Free plan limits after downgrading, you can view existing data but won\'t be able to create new jobs until you\'re back within limits or upgrade again.'
		},
		{
			question: 'Do you take a cut of jobs I complete?',
			answer:
				'No. Loadr is a job management tool, not a marketplace. We charge a flat subscription for software; we never take a percentage of your deliveries or revenue.'
		},
		{
			question: 'Is my proof of delivery data secure?',
			answer:
				'Yes. Photos and signatures are stored securely in Supabase with row-level security. Cryptographic hashes are anchored on Solana for tamper-proof verification; no personal data goes on-chain.'
		},
		{
			question: 'Do I need a credit card to start?',
			answer:
				'No credit card is needed for the Free plan or to start a trial on Starter or Pro. You\'ll only be asked for payment details when you choose a paid plan after your trial.'
		}
	];

	let openIndex = $state<number | null>(null);

	function toggle(index: number) {
		openIndex = openIndex === index ? null : index;
	}
</script>

<section class="bg-white px-5 py-16 lg:px-8 lg:py-20 dark:bg-transparent">
	<RevealOnScroll class="mx-auto max-w-[700px]">
		<h2
			class="text-center font-syne text-2xl font-bold text-gray-900 lg:text-[28px] dark:text-slate-100"
		>
			Frequently asked questions
		</h2>

		<div class="mt-8 lg:mt-10">
			{#each faqs as faq, index (faq.question)}
				<div class="border-b border-gray-200 dark:border-slate-700">
					<button
						type="button"
						class="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
						aria-expanded={openIndex === index}
						aria-controls="faq-answer-{index}"
						id="faq-question-{index}"
						onclick={() => toggle(index)}
					>
						<span
							class="font-inter text-[15px] font-semibold text-gray-900 lg:text-base dark:text-slate-100"
						>
							{faq.question}
						</span>
						<svg
							class="size-[18px] shrink-0 text-gray-500 transition-transform duration-300 ease-out motion-reduce:transition-none dark:text-slate-400 {openIndex ===
							index
								? 'rotate-180'
								: 'rotate-0'}"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="m6 9 6 6 6-6"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
					{#if openIndex === index}
						<div
							id="faq-answer-{index}"
							role="region"
							aria-labelledby="faq-question-{index}"
							transition:slide={{ duration: 300, easing: quintOut, axis: 'y' }}
						>
							<p class="pb-5 font-inter text-sm leading-relaxed text-gray-500 dark:text-slate-400">
								{faq.answer}
							</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</RevealOnScroll>
</section>
