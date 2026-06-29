<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		message: string;
	} & HTMLAttributes<HTMLDivElement>;

	let { message, class: className = '', ...rest }: Props = $props();
</script>

<div
	class="flex min-h-11 w-full max-w-[350px] items-center rounded-[10px] border border-red-200 bg-red-50 px-3.5 dark:border-red-900 dark:bg-red-950 {className}"
	role="alert"
	{...rest}
>
	<p class="font-inter text-xs font-medium text-red-700 dark:text-red-300">{message}</p>
</div>
