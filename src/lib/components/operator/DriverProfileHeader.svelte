<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	type Props = {
		driverName: string;
		onRemove?: () => void;
	};

	let { driverName, onRemove }: Props = $props();
</script>

<header
	class="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8 dark:border-slate-700 dark:bg-slate-900 z-10"
>
	<nav class="flex items-center gap-1.5" aria-label="Breadcrumb">
		<a
			href="/drivers"
			class="font-inter text-sm text-brand transition-colors hover:text-[#178566]"
		>
			Drivers
		</a>
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			class="text-gray-400 dark:text-slate-500"
			aria-hidden="true"
		>
			<path
				d="m5 3 4 4-4 4"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		<span class="font-inter text-sm font-medium text-gray-900 dark:text-slate-100">
			{driverName}
		</span>
	</nav>

	<div class="flex items-center gap-3">
		<ThemeToggle />
		<Button
			type="button"
			variant="secondary"
			class="gap-1.5 text-gray-500 dark:text-slate-400"
			onclick={() => onRemove?.()}
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<circle cx="8" cy="5.5" r="2" stroke="currentColor" stroke-width="1.5" />
				<path
					d="M3.5 13.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5M11.5 5.5h2.5"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
			Remove Driver
		</Button>
	</div>
</header>
