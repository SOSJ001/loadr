<script lang="ts">
	type Props = {
		children: import('svelte').Snippet;
	};

	let { children }: Props = $props();
</script>

<aside
	class="flex w-full items-start gap-1.5 rounded-lg border border-transparent bg-gray-100 px-2.5 py-2 sm:px-3 sm:py-2.5 dark:border-slate-700 dark:bg-slate-900"
	role="note"
>
	<svg
		class="mt-px size-3.5 shrink-0 text-gray-500 dark:text-slate-400"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		aria-hidden="true"
	>
		<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
		<path
			d="M12 11v5M12 8h.01"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
	</svg>
	<p class="min-w-0 flex-1 font-inter text-xs leading-normal text-gray-500 dark:text-slate-400">
		{@render children()}
	</p>
</aside>
