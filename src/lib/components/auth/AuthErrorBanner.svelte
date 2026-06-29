<script lang="ts">
	type Props = {
		message: string;
	};

	let { message }: Props = $props();
</script>

<div
	role="alert"
	class="flex h-10 w-full items-center gap-2.5 rounded-lg border border-red-200 bg-red-100 px-3.5 dark:border-red-900 dark:bg-red-950/60"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		aria-hidden="true"
		class="shrink-0 text-red-600 dark:text-red-500"
	>
		<circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
		<path
			d="M8 4.75v4M8 11h.01"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
	</svg>
	<p class="font-inter min-w-0 flex-1 text-xs text-red-600 dark:text-red-500">{message}</p>
</div>
