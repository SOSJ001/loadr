<script lang="ts">
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	type Props = {
		onJobsNavigate?: (event: MouseEvent) => void;
	};

	let { onJobsNavigate }: Props = $props();
</script>

<header
	class="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8 dark:border-slate-700 dark:bg-slate-900"
>
	<nav class="flex items-center gap-1.5" aria-label="Breadcrumb">
		<a
			href="/jobs"
			class="font-inter text-sm text-brand transition-colors hover:text-[#178566]"
			onclick={(event) => onJobsNavigate?.(event)}
		>
			Jobs
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
		<span class="font-inter text-sm font-medium text-gray-900 dark:text-slate-100">New Job</span>
	</nav>

	<ThemeToggle />
</header>
