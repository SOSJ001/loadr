<script lang="ts">
	import type { JobStatus } from '$lib/types/job';

	type Props = { status: JobStatus | string };

	let { status }: Props = $props();

	const config = $derived.by(() => {
		switch (status) {
			case 'pending':
				return { label: 'Pending', class: 'bg-amber-100 text-amber-600' };
			case 'in_progress':
				return { label: 'In Progress', class: 'bg-blue-100 text-blue-700' };
			case 'complete':
				return { label: 'Complete', class: 'bg-green-100 text-green-600' };
			case 'attempted':
				return { label: 'Attempted', class: 'bg-red-100 text-red-600' };
			default:
				return { label: status, class: 'bg-gray-100 text-gray-700' };
		}
	});
</script>

<span
	class="inline-flex shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 font-syne text-xs font-medium leading-tight {config.class}"
>
	{config.label}
</span>
