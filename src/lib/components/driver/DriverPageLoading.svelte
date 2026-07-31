<script lang="ts">
	type Props = {
		label?: string;
	};

	let { label = 'Loading…' }: Props = $props();
</script>

<div class="flex min-h-full flex-1 flex-col items-center justify-center bg-white px-5 dark:bg-slate-900">
	<div
		class="size-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand dark:border-slate-700 dark:border-t-brand"
		aria-hidden="true"
	></div>
	<p class="font-inter mt-4 text-sm text-gray-500 dark:text-slate-400">{label}</p>
</div>
