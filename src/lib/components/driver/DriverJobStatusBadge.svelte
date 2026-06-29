<script lang="ts">
	import type { JobStatus } from '$lib/types/job';

	type Props = {
		status: JobStatus;
		class?: string;
	};

	let { status, class: className = '' }: Props = $props();

	const styles: Record<JobStatus, string> = {
		pending: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
		in_progress: 'bg-blue-100 text-blue-600 dark:bg-[#1e3a5f] dark:text-[#93c5fd]',
		complete: 'bg-green-100 text-green-700 dark:bg-[#14532d] dark:text-[#86efac]',
		attempted: 'bg-red-100 text-red-600 dark:bg-[#450a0a] dark:text-[#fca5a5]'
	};

	const labels: Record<JobStatus, string> = {
		pending: 'Pending',
		in_progress: 'In Progress',
		complete: 'Complete',
		attempted: 'Attempted'
	};
</script>

<span
	class="font-inter shrink-0 rounded-full px-3 py-1 text-xs font-semibold {styles[status]} {className}"
>
	{labels[status]}
</span>
