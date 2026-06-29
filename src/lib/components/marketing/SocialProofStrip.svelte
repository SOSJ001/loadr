<script lang="ts">
	import RevealOnScroll from '$lib/components/marketing/RevealOnScroll.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const trustItems = [
		'Free for 3 drivers',
		'No credit card',
		'UK GDPR compliant',
		'Tamper-proof PoD'
	] as const;

	const fleetTypes = ['Courier', 'Haulage', 'Same-day', 'Multi-drop', 'Owner-operators'] as const;
</script>

<section class="bg-gray-50 px-5 py-16 lg:px-8 dark:bg-slate-900">
	<RevealOnScroll class="mx-auto w-full max-w-[1216px]">
		<div
			class="mx-auto flex w-full max-w-[350px] flex-col items-center gap-5 rounded-[20px] border border-gray-200 bg-white px-5 py-7 text-center shadow-[0_8px_24px_rgba(0,0,0,0.06)] lg:max-w-none lg:gap-6 lg:p-10 dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
		>
			<div
				class="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-100 px-3.5 py-1.5 dark:border-emerald-800 dark:bg-emerald-900"
			>
				<img
					src="/images/marketing/icons/early-access-dot-light.svg"
					alt=""
					class="size-3.5 dark:hidden"
					width="14"
					height="14"
					aria-hidden="true"
				/>
				<img
					src="/images/marketing/icons/early-access-dot-dark.svg"
					alt=""
					class="hidden size-3.5 dark:block"
					width="14"
					height="14"
					aria-hidden="true"
				/>
				<span class="font-inter text-[13px] font-semibold text-green-600 dark:text-green-400">
					Early access open
				</span>
			</div>

			<h2
				class="font-syne text-[22px] font-bold leading-tight text-gray-900 lg:text-[26px] dark:text-slate-100"
			>
				Be among the first UK fleets on Loadr.
			</h2>

			<div
				class="h-px w-full max-w-[310px] bg-gray-200 lg:max-w-[640px] dark:bg-slate-700"
				aria-hidden="true"
			></div>

			<div class="flex flex-col gap-2.5 lg:gap-2.5">
				<div class="flex flex-col items-center gap-2.5 lg:flex-row lg:justify-center lg:gap-8">
					{#each trustItems.slice(0, 2) as item (item)}
						<div class="flex items-center gap-2">
							<img
								src="/images/marketing/icons/check-light.svg"
								alt=""
								class="size-4 shrink-0 dark:hidden"
								width="16"
								height="16"
								aria-hidden="true"
							/>
							<img
								src="/images/marketing/icons/check-dark.svg"
								alt=""
								class="hidden size-4 shrink-0 dark:block"
								width="16"
								height="16"
								aria-hidden="true"
							/>
							<span class="font-inter text-sm font-medium text-gray-700 dark:text-slate-100"
								>{item}</span
							>
						</div>
					{/each}
				</div>
				<div class="flex flex-col items-center gap-2.5 lg:flex-row lg:justify-center lg:gap-8">
					{#each trustItems.slice(2) as item (item)}
						<div class="flex items-center gap-2">
							<img
								src="/images/marketing/icons/check-light.svg"
								alt=""
								class="size-4 shrink-0 dark:hidden"
								width="16"
								height="16"
								aria-hidden="true"
							/>
							<img
								src="/images/marketing/icons/check-dark.svg"
								alt=""
								class="hidden size-4 shrink-0 dark:block"
								width="16"
								height="16"
								aria-hidden="true"
							/>
							<span class="font-inter text-sm font-medium text-gray-700 dark:text-slate-100"
								>{item}</span
							>
						</div>
					{/each}
				</div>
			</div>

			<div class="flex flex-wrap items-center justify-center gap-2">
				{#each fleetTypes as type (type)}
					<span
						class="rounded-full border border-gray-200 px-2.5 py-1.5 font-inter text-xs font-medium text-gray-500 dark:border-slate-700 dark:text-slate-400"
					>
						{type}
					</span>
				{/each}
			</div>

			<Button
				href="/signup"
				variant="brand"
				class="h-[52px] w-full max-w-[310px] gap-2 rounded-[10px] px-7 text-base lg:w-auto lg:max-w-none"
			>
				Get early access
				<img
					src="/images/marketing/icons/arrow-right-white.svg"
					alt=""
					class="size-[18px]"
					width="18"
					height="18"
					aria-hidden="true"
				/>
			</Button>

			<p class="font-inter text-[13px] text-gray-400 dark:text-slate-400">
				Setup takes less than 5 minutes
			</p>
		</div>
	</RevealOnScroll>
</section>
