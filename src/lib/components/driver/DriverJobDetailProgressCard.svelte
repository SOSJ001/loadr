<script lang="ts">
	import DriverJobStatusBadge from '$lib/components/driver/DriverJobStatusBadge.svelte';
	import type { DriverJobProgressStage } from '$lib/types/driver-job-detail';
	import type { JobStatus } from '$lib/types/job';
	import { formatDriverProgressTimestamp } from '$lib/utils/driver-job-detail';
	import { AlertCircle, Check, Play } from '@lucide/svelte';

	type Props = {
		status: JobStatus;
		stages: DriverJobProgressStage[];
	};

	let { status, stages }: Props = $props();

	function connectorClass(stage: DriverJobProgressStage): string {
		if (stage.state === 'complete') {
			return 'border-l-2 border-brand';
		}
		if (stage.state === 'current' && stage.tone === 'danger') {
			return 'border-l-2 border-red-600';
		}
		return 'border-l-2 border-dashed border-gray-200 dark:border-slate-700';
	}
</script>

<section
	class="flex w-full flex-col gap-4 rounded-[14px] border border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-slate-800"
>
	<div class="flex items-center justify-between">
		<h2 class="font-syne text-[15px] font-bold text-gray-900 dark:text-slate-100">Progress</h2>
		<DriverJobStatusBadge {status} />
	</div>

	<ol class="flex flex-col">
		{#each stages as stage, index (stage.id)}
			<li class="flex gap-3">
				<div class="flex flex-col items-center">
					<div class="relative flex size-11 items-center justify-center">
						{#if stage.state === 'current' && stage.tone === 'danger'}
							<div
								class="flex size-7 items-center justify-center rounded-[14px] bg-red-600 text-white"
								aria-hidden="true"
							>
								<AlertCircle size={12} stroke-width={2.5} />
							</div>
						{:else if stage.state === 'current'}
							<div
								class="absolute size-11 rounded-[22px] bg-green-100 dark:bg-green-950"
								aria-hidden="true"
							></div>
							<div
								class="relative flex size-7 items-center justify-center rounded-[14px] bg-brand text-white"
								aria-hidden="true"
							>
								<Play size={12} fill="currentColor" aria-hidden="true" />
							</div>
						{:else if stage.state === 'complete'}
							<div
								class="flex size-7 items-center justify-center rounded-[14px] bg-brand text-white"
								aria-hidden="true"
							>
								<Check size={12} stroke-width={2.5} />
							</div>
						{:else}
							<div
								class="size-7 rounded-[14px] border-2 border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800"
								aria-hidden="true"
							></div>
						{/if}
					</div>
					{#if index < stages.length - 1}
						<div class="h-5 w-0.5 {connectorClass(stage)}" aria-hidden="true"></div>
					{/if}
				</div>

				<div class="flex min-w-0 flex-1 items-start justify-between gap-3 pb-5">
					<div class="min-w-0">
						<p
							class="font-inter text-sm {stage.state === 'current' && stage.tone === 'danger'
								? 'font-bold text-red-600'
								: stage.state === 'current'
									? 'font-bold text-brand'
									: stage.state === 'complete'
										? 'font-semibold text-gray-900 dark:text-slate-100'
										: 'font-semibold text-gray-500 dark:text-slate-400'}"
						>
							{stage.label}
						</p>
						{#if stage.reason_tag}
							<span
								class="font-inter mt-1 inline-flex rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-[#450a0a] dark:text-red-600"
							>
								{stage.reason_tag}
							</span>
						{:else if stage.subtitle}
							<p
								class="font-inter text-xs {stage.state === 'current'
									? 'text-brand'
									: 'text-gray-500 dark:text-slate-400'}"
							>
								{stage.subtitle}
							</p>
						{/if}
					</div>
					{#if (stage.state === 'complete' || stage.state === 'current') && stage.timestamp}
						<p class="font-inter shrink-0 text-[11px] text-gray-500 dark:text-slate-400">
							{formatDriverProgressTimestamp(stage.timestamp)}
						</p>
					{/if}
				</div>
			</li>
		{/each}
	</ol>
</section>
