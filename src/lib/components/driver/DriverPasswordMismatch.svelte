<script lang="ts">
	import { CircleX } from '@lucide/svelte';

	type Props = {
		message?: string;
	};

	let { message = "Passwords don't match" }: Props = $props();
</script>

<div class="flex items-center gap-1.5">
	<CircleX size={14} class="text-red-600 dark:text-red-500" stroke-width={2} aria-hidden="true" />
	<p class="font-inter text-xs font-medium text-red-600 dark:text-red-500">{message}</p>
</div>
