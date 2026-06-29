<script lang="ts">
	type Props = {
		current?: number;
		total?: number;
	};

	let { current = 1, total = 2 }: Props = $props();
</script>

<div class="flex flex-col items-center gap-1.5 py-3">
	<div class="flex items-center gap-2" aria-hidden="true">
		{#each Array.from({ length: total }, (_, index) => index + 1) as step (step)}
			<div
				class="size-2 rounded-full {step <= current
					? 'bg-brand'
					: 'border border-gray-200 bg-transparent dark:border-slate-600'}"
			></div>
		{/each}
	</div>
	<p class="font-inter text-[11px] text-gray-500 dark:text-slate-400">
		Step {current} of {total}
	</p>
</div>
