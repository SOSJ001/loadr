<script lang="ts">
	type Stat = {
		label: string;
		dotClass: string;
	};

	type Props = {
		stats: Stat[];
	};

	let { stats }: Props = $props();
</script>

<div class="flex flex-wrap gap-3">
	{#each stats as stat (stat.label)}
		<div
			class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 dark:border-slate-700 dark:bg-slate-800"
		>
			<span class="size-2 shrink-0 rounded-sm {stat.dotClass}" aria-hidden="true"></span>
			<span class="font-inter text-[13px] font-medium text-gray-900 dark:text-slate-100">
				{stat.label}
			</span>
		</div>
	{/each}
</div>
