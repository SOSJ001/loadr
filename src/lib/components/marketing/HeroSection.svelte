<script lang="ts">
	import DashboardMockup from '$lib/components/marketing/DashboardMockup.svelte';
	import RevealOnScroll from '$lib/components/marketing/RevealOnScroll.svelte';
	import Button from '$lib/components/ui/Button.svelte';
</script>

<section
	class="flex flex-col items-center gap-10 bg-gradient-to-b from-white to-green-50 px-5 py-12 dark:from-slate-900 dark:to-green-950 lg:gap-12 lg:px-8 lg:pt-20 lg:pb-16"
>
	<div class="flex w-full max-w-[800px] flex-col items-center text-center">
		<RevealOnScroll when="mount" delay={0}>
			<div
				class="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-100 px-4 py-1.5 dark:border-green-800 dark:bg-green-950"
			>
				<span class="size-3.5 rounded-full bg-green-500 dark:bg-green-400" aria-hidden="true"></span>
				<span class="text-[13px] font-semibold text-green-600 dark:text-green-400">
					Built for UK transport carriers
				</span>
			</div>
		</RevealOnScroll>

		<RevealOnScroll when="mount" delay={80} class="mt-6 w-full">
			<h1
				class="font-syne text-[32px] font-extrabold leading-[1.15] text-gray-900 lg:text-5xl dark:text-slate-100"
			>
				Your vans drive home empty. That's money leaking out every single day.
			</h1>
		</RevealOnScroll>

		<RevealOnScroll when="mount" delay={160} class="mt-5 w-full">
			<p
				class="mx-auto max-w-[600px] text-base leading-relaxed text-gray-500 lg:text-lg dark:text-slate-400"
			>
				Loadr is the free job management tool built for small carriers, track every job, capture proof
				of delivery, and stop losing money on empty return legs.
			</p>
		</RevealOnScroll>

		<RevealOnScroll when="mount" delay={240} class="mt-8 w-full lg:mt-9">
			<div
				class="mx-auto flex w-full max-w-[302px] flex-col gap-3 lg:max-w-none lg:flex-row lg:flex-wrap lg:justify-center"
			>
				<Button
					href="/signup"
					variant="brand"
					class="h-[52px] w-full gap-2 rounded-[10px] px-7 text-base lg:h-auto lg:w-auto lg:py-4"
				>
					Sign up free
					<span class="font-inter text-lg font-normal">→</span>
				</Button>
				<Button
					href="/pricing"
					variant="secondary"
					class="h-[52px] w-full rounded-[10px] px-7 text-base lg:h-auto lg:w-auto lg:py-4"
				>
					See pricing
				</Button>
			</div>
		</RevealOnScroll>

		<RevealOnScroll when="mount" delay={320} class="mt-4 w-full">
			<div
				class="flex items-center justify-center gap-1.5 text-[13px] text-gray-500 dark:text-slate-400"
			>
				<span class="size-3.5 rounded-full bg-green-500 dark:bg-green-400" aria-hidden="true"></span>
				No credit card required · Free for up to 3 drivers
			</div>
			<p class="mt-3 text-center text-[13px] text-gray-500 dark:text-slate-400">
				<strong class="font-medium text-gray-700 dark:text-slate-300">Drivers:</strong>
				<a href="/login/driver" class="font-medium text-brand hover:underline">Log in to the app</a>
				· Invited? Use the link in your SMS
			</p>
		</RevealOnScroll>
	</div>

	<RevealOnScroll when="mount" delay={420} variant="scale" class="w-full max-w-[1000px]">
		<DashboardMockup />
	</RevealOnScroll>
</section>
