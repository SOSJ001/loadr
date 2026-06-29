<script lang="ts">
	import { AlertCircle } from '@lucide/svelte';
</script>

<div
	role="alert"
	class="flex items-center gap-2 rounded-lg border-4 border-red-600 bg-red-100 px-4 py-3 dark:border-red-500 dark:bg-red-950/40"
>
	<AlertCircle size={16} class="shrink-0 text-red-600 dark:text-red-500" aria-hidden="true" />
	<p class="font-inter text-[13px] font-medium text-red-600 dark:text-red-500">
		Please fix the errors below before continuing
	</p>
</div>
