<script lang="ts">
	import { ChevronLeft } from '@lucide/svelte';
	import DriverJobStatusBadge from '$lib/components/driver/DriverJobStatusBadge.svelte';
	import type { JobStatus } from '$lib/types/job';

	type Props = {
		reference: string;
		status: JobStatus;
		backHref?: string;
	};

	let { reference, status, backHref = '/jobs' }: Props = $props();
</script>

<header class="flex h-[52px] shrink-0 items-center justify-between px-5">
	<a
		href={backHref}
		class="flex size-11 shrink-0 items-center justify-center rounded-lg text-gray-900 transition-colors hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-slate-800"
		aria-label="Go back"
	>
		<ChevronLeft size={20} stroke-width={1.75} aria-hidden="true" />
	</a>

	<h1 class="font-syne text-base font-bold text-gray-900 dark:text-slate-100">Job {reference}</h1>

	<DriverJobStatusBadge {status} />
</header>
