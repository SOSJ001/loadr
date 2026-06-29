<script lang="ts">
	import RevealOnScroll from '$lib/components/marketing/RevealOnScroll.svelte';
	import Button from '$lib/components/ui/Button.svelte';
</script>

<section
	class="bg-gradient-to-r from-brand to-[#0f6e56] px-5 py-14 text-center text-white lg:px-8 lg:py-16"
>
	<RevealOnScroll variant="scale">
		<h2 class="font-syne text-[28px] font-extrabold lg:text-[32px]">
			Stop losing money on empty miles
		</h2>
		<p class="mt-3 text-base text-white/85">Join free today, no credit card, no commitment.</p>
		<div class="mt-6 flex justify-center">
			<Button
				href="/signup"
				variant="secondary"
				class="h-[52px] w-full max-w-[302px] gap-2 rounded-[10px] border-0 bg-white px-7 text-base font-bold text-brand hover:bg-white/95 dark:!border-0 dark:!bg-white dark:!text-brand dark:hover:!bg-white/95 lg:h-auto lg:w-auto lg:max-w-none lg:py-4"
			>
				Sign up free
				<span class="font-inter text-lg font-normal">→</span>
			</Button>
		</div>
	</RevealOnScroll>
</section>
