<script lang="ts">
	type Props = {
		/** Tighter spacing for the preview card route column. */
		compact?: boolean;
	};

	let { compact = false }: Props = $props();
</script>

<div
	class="flex {compact ? 'h-3 pl-1' : 'h-9 pl-[22px]'}"
	aria-hidden="true"
>
	<div
		class="h-full w-px {compact
			? 'bg-gray-200 dark:bg-slate-600'
			: 'border-l border-dashed border-gray-300 dark:border-slate-600'}"
	></div>
</div>
