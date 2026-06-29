<script lang="ts">
	type Tone = 'pending' | 'in_progress' | 'completed';

	type Props = {
		label: string;
		value: number;
		description: string;
		tone: Tone;
	};

	let { label, value, description, tone }: Props = $props();

	const toneStyles = {
		pending: 'text-amber-600',
		in_progress: 'text-blue-700',
		completed: 'text-green-600'
	} as const;

	const valueClass = $derived(toneStyles[tone]);
</script>

<div
	class="rounded-xl border border-gray-200 bg-gray-50 px-6 py-5 dark:border-slate-700 dark:bg-slate-800"
>
	<div class="flex items-center justify-between gap-4">
		<p class="font-inter text-[13px] font-medium text-gray-500 dark:text-slate-400">{label}</p>
		<div class="text-gray-500 dark:text-slate-400" aria-hidden="true">
			{#if tone === 'pending'}
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
					<path
						d="M8 5v3.5l2 1"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
			{:else if tone === 'in_progress'}
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<rect
						x="2"
						y="5"
						width="12"
						height="6"
						rx="1"
						stroke="currentColor"
						stroke-width="1.5"
					/>
					<path
						d="M4 5 5.5 3h5L12 5"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linejoin="round"
					/>
					<circle cx="5" cy="11" r="1" fill="currentColor" />
					<circle cx="11" cy="11" r="1" fill="currentColor" />
				</svg>
			{:else}
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
					<path
						d="M5.5 8.25 7 10 10.75 6.25"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			{/if}
		</div>
	</div>
	<p class="font-syne mt-2 text-[32px] leading-none font-extrabold {valueClass}">{value}</p>
	<p class="font-inter mt-2 text-xs text-gray-500 dark:text-slate-400">{description}</p>
</div>
