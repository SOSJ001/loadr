<script lang="ts">
	type Props = {
		message: string;
	};

	let { message }: Props = $props();
</script>

<div
	role="status"
	class="flex min-h-10 w-full items-center gap-2.5 rounded-lg border border-green-200 bg-green-100 px-3.5 py-2 dark:border-green-900 dark:bg-green-950/60"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		aria-hidden="true"
		class="shrink-0 text-green-600 dark:text-green-500"
	>
		<circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
		<path
			d="M5.25 8.25 7 10 10.75 6.25"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
	<p class="font-inter min-w-0 flex-1 text-xs text-green-700 dark:text-green-400">{message}</p>
</div>
