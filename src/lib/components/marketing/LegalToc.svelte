<script lang="ts">
	type TocItem = {
		id: string;
		label: string;
	};

	type Props = {
		items: TocItem[];
		activeId?: string | null;
	};

	let { items, activeId = null }: Props = $props();
</script>

<nav aria-label="On this page" class="flex flex-col gap-3">
	<p class="text-xs font-semibold tracking-wider text-gray-500 dark:text-slate-400">
		ON THIS PAGE
	</p>
	<ul class="flex flex-col gap-3">
		{#each items as item (item.id)}
			<li>
				<a
					href="#{item.id}"
					class="font-inter text-sm transition-colors {activeId === item.id
						? 'font-medium text-brand'
						: 'text-gray-500 hover:text-brand dark:text-slate-400 dark:hover:text-brand'}"
					aria-current={activeId === item.id ? 'location' : undefined}
				>
					{item.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
