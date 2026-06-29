<script lang="ts">
	type Props = {
		children: import('svelte').Snippet;
	};

	let { children }: Props = $props();
</script>

<aside
	class="flex w-full items-start gap-3 rounded-[10px] border border-blue-200 bg-blue-50 p-4 dark:border-blue-500 dark:bg-[#1e3a5f]"
	role="note"
>
	<svg
		class="size-4 shrink-0 text-blue-600 dark:text-blue-400"
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
	<p class="min-w-0 flex-1 font-inter text-[13px] leading-[1.5] text-blue-700 dark:text-blue-300">
		{@render children()}
	</p>
</aside>
