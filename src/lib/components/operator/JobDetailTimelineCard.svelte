<script lang="ts">
	import { jobDetailCardClass } from '$lib/components/operator/job-detail-ui';
	import type { OperatorJobTimelineEvent } from '$lib/types/operator-job-detail';
	import { formatJobDetailTimelineTimestamp } from '$lib/utils/operator-job-detail';
	import { Check, Clock, X } from '@lucide/svelte';

	type Props = {
		events: OperatorJobTimelineEvent[];
	};

	let { events }: Props = $props();

	const cardClass = jobDetailCardClass;
</script>

<section class={cardClass}>
	<Clock size={16} class="text-amber-500" aria-hidden="true" />

	<ol class="relative mt-4 space-y-0 pl-1">
		<div
			class="absolute top-2 bottom-2 left-[15px] w-0.5 bg-gray-200 dark:bg-slate-700"
			aria-hidden="true"
		></div>

		{#each events as event (event.id)}
			<li class="relative flex gap-4 py-2">
				<div class="flex h-10 w-8 shrink-0 items-center justify-center">
					{#if event.state === 'complete'}
						<div
							class="flex size-5 items-center justify-center rounded-[10px] bg-brand text-white"
							aria-hidden="true"
						>
							<Check size={14} stroke-width={2.5} />
						</div>
					{:else if event.state === 'active'}
						<div class="relative flex size-8 items-center justify-center" aria-hidden="true">
							<div class="absolute size-8 rounded-full bg-green-100 dark:bg-green-950/50"></div>
							<div class="relative size-5 rounded-[10px] bg-brand"></div>
						</div>
					{:else if event.state === 'failed'}
						<div
							class="flex size-5 items-center justify-center rounded-[10px] bg-red-600 text-white"
							aria-hidden="true"
						>
							<X size={10} stroke-width={2.5} />
						</div>
					{:else}
						<div
							class="size-5 rounded-[10px] border-2 border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
							aria-hidden="true"
						></div>
					{/if}
				</div>

				<div class="flex min-w-0 flex-1 flex-col gap-1">
					<div class="flex items-center justify-between gap-3">
						<p
							class="font-inter text-sm {event.state === 'failed'
								? 'font-semibold text-red-600 dark:text-red-500'
								: event.state === 'active'
									? 'font-semibold text-brand'
									: event.state === 'complete'
										? 'font-semibold text-gray-900 dark:text-slate-100'
										: 'text-gray-500 dark:text-slate-400'}"
						>
							{event.label}
						</p>
						{#if event.statusLabel}
							<p class="font-inter shrink-0 text-xs text-brand">{event.statusLabel}</p>
						{:else if event.timestamp}
							<p class="font-inter shrink-0 text-xs text-gray-500 dark:text-slate-400">
								{formatJobDetailTimelineTimestamp(event.timestamp)}
							</p>
						{/if}
					</div>
					{#if event.reason}
						<span
							class="inline-flex w-fit rounded-full bg-red-100 px-2 py-0.5 font-inter text-xs font-medium text-red-600 dark:bg-red-950/60 dark:text-red-400"
						>
							{event.reason}
						</span>
					{/if}
				</div>
			</li>
		{/each}
	</ol>
</section>
