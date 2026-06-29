<script lang="ts">
	const tips = [
		'Add detailed notes to help your driver — gate codes, contact numbers, and access instructions prevent failed deliveries',
		'Assigning a specific driver sends them an instant notification on their phone',
		"Jobs are automatically tracked — you'll see real-time status updates as your driver progresses"
	];
</script>

<section
	class="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-slate-700 dark:bg-slate-800"
>
	<div class="flex items-center gap-1.5">
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			class="text-blue-700 dark:text-slate-100"
			aria-hidden="true"
		>
			<path
				d="M8 1.5a4.5 4.5 0 0 0-2.2 8.4V12a.8.8 0 0 0 .8.8h2.8a.8.8 0 0 0 .8-.8v-2.1A4.5 4.5 0 0 0 8 1.5Z"
				stroke="currentColor"
				stroke-width="1.25"
			/>
			<path d="M6.2 14.2h3.6" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
		</svg>
		<h2 class="font-syne text-sm font-bold text-blue-700 dark:text-slate-100">Tips</h2>
	</div>

	<ul class="mt-3 space-y-3">
		{#each tips as tip (tip)}
			<li class="flex gap-2">
				<span
					class="mt-2 size-1 shrink-0 rounded-sm bg-blue-500 dark:bg-blue-500"
					aria-hidden="true"
				></span>
				<p class="font-inter text-[13px] leading-relaxed text-blue-700 dark:text-slate-100">
					{tip}
				</p>
			</li>
		{/each}
	</ul>
</section>
