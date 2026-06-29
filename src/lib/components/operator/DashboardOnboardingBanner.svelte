<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
</script>

<div
	class="flex flex-col gap-4 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-blue-900 dark:bg-blue-950/40"
>
	<div class="flex min-w-0 items-start gap-2.5">
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			class="mt-0.5 shrink-0 text-blue-700 dark:text-blue-400"
			aria-hidden="true"
		>
			<circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5" />
			<path d="M8 7v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			<circle cx="8" cy="5.25" r="0.75" fill="currentColor" />
		</svg>
		<div class="min-w-0">
			<p class="font-inter text-sm font-semibold text-blue-700 dark:text-blue-400">
				Welcome to Loadr — let's get you set up
			</p>
			<p class="font-inter mt-1 text-[13px] text-gray-500 dark:text-slate-400">
				Add your first driver to start assigning jobs
			</p>
		</div>
	</div>
	<Button href="/drivers" variant="brand" class="shrink-0 px-4 py-2 text-xs">
		Add driver
	</Button>
</div>
