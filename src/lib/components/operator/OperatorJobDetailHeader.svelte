<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	type Props = {
		reference: string;
		jobId: string;
		invoiceEnabled?: boolean;
	};

	let { reference, jobId, invoiceEnabled = true }: Props = $props();
</script>

<header
	class="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8 dark:border-slate-700 dark:bg-slate-900"
>
	<nav class="flex items-center gap-1.5" aria-label="Breadcrumb">
		<a
			href="/jobs"
			class="font-inter text-sm text-brand transition-colors hover:text-[#178566]"
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
		<span class="font-inter text-sm font-medium text-gray-900 dark:text-slate-100">
			Job {reference}
		</span>
	</nav>

	<div class="flex items-center gap-3">
		<ThemeToggle />
		<Button href="/jobs/{jobId}/edit" variant="secondary" class="gap-1.5 dark:border-slate-700 dark:bg-slate-900">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path
					d="M11.5 2.5 13.5 4.5 5 13H3v-2L11.5 2.5Z"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linejoin="round"
				/>
			</svg>
			Edit job
		</Button>
		<Button
			variant="brand"
			disabled={!invoiceEnabled}
			class="gap-1.5 {!invoiceEnabled
				? 'bg-gray-300 text-gray-400 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-500 dark:hover:bg-slate-600'
				: ''}"
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path
					d="M5 3.5h6a1 1 0 0 1 1 1v8.5H4V4.5a1 1 0 0 1 1-1Z"
					stroke="currentColor"
					stroke-width="1.5"
				/>
				<path d="M6 6.5h4M6 9h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
			Generate Invoice
		</Button>
	</div>
</header>
