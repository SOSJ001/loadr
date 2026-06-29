<script lang="ts">
	import { ChevronLeft } from '@lucide/svelte';

	type Props = {
		title: string;
		backHref: string;
	};

	let { title, backHref }: Props = $props();
</script>

<header class="flex h-[52px] shrink-0 items-center justify-between px-5">
	<a
		href={backHref}
		class="flex size-11 shrink-0 items-center justify-center rounded-lg text-gray-900 transition-colors hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-slate-800"
		aria-label="Go back"
	>
		<ChevronLeft size={20} stroke-width={1.75} aria-hidden="true" />
	</a>

	<h1 class="font-syne text-base font-bold text-gray-900 dark:text-slate-100">{title}</h1>

	<div class="size-11 shrink-0" aria-hidden="true"></div>
</header>
