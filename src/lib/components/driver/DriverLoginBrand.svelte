<script lang="ts">
	import { Truck } from '@lucide/svelte';

	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();
</script>

<div class="flex flex-col items-center {className}">
	<p class="font-syne text-[32px] font-extrabold leading-9 text-gray-900 dark:text-slate-100">
		load<span class="text-brand">r</span>
	</p>
	<p class="font-inter mt-2 text-sm text-gray-500 dark:text-slate-400">Your jobs. Your day.</p>
	<div
		class="mt-4 flex size-12 items-center justify-center text-brand"
		aria-hidden="true"
	>
		<Truck size={48} stroke-width={1.5} />
	</div>
</div>
