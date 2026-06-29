<script lang="ts">
	import { Gem } from '@lucide/svelte';
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-2.5 px-5">
	<Gem
		size={52}
		stroke-width={1.25}
		class="text-gray-400 dark:text-slate-500"
		aria-hidden="true"
	/>
	<h2 class="font-syne text-lg font-bold text-gray-900 dark:text-slate-100">No jobs today</h2>
	<p class="font-inter max-w-[280px] text-center text-sm text-gray-500 dark:text-slate-400">
		Your operator will assign jobs here
	</p>
</div>
