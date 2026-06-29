<script lang="ts">
	import type { DriverStatus } from '$lib/types/drivers';

	type Props = {
		status: DriverStatus;
		detail?: string;
	};

	let { status, detail }: Props = $props();

	const config = $derived(
		status === 'active'
			? {
					label: 'Active',
					wrap: 'bg-green-100',
					dot: 'bg-green-600',
					text: 'text-green-600'
				}
			: {
					label: 'Pending',
					wrap: 'bg-gray-100 dark:bg-slate-800',
					dot: 'bg-gray-400 dark:bg-slate-500',
					text: 'text-gray-500 dark:text-slate-400'
				}
	);
</script>

<div class="flex flex-col gap-1">
	<span
		class="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 {config.wrap}"
	>
		<span class="size-1.5 shrink-0 rounded-sm {config.dot}" aria-hidden="true"></span>
		<span class="font-syne text-xs font-bold {config.text}">{config.label}</span>
	</span>
	{#if detail}
		<span class="font-inter text-[11px] text-gray-500 dark:text-slate-400">{detail}</span>
	{/if}
</div>
