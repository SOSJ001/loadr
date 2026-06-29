<script lang="ts">
	import {
		AlertCircle,
		ArrowLeft,
		ClipboardList,
		Clock,
		Package,
		Phone
	} from '@lucide/svelte';
	import DriverJobSubpageTopNav from '$lib/components/driver/DriverJobSubpageTopNav.svelte';
	import type { DriverJobFlowContext } from '$lib/types/driver-job-flow';
	import { reportIssueJobRefLabel } from '$lib/utils/driver-report-issue-theme';

	type Props = {
		job: DriverJobFlowContext;
		preview?: boolean;
	};

	let { job, preview = false }: Props = $props();

	const jobRefLabel = $derived(reportIssueJobRefLabel(job.dropoff_address));
	const backHref = $derived(preview ? '/jobs' : `/jobs/${job.id}`);

	const whatsNextItems = [
		{ icon: Clock, text: 'Your operator will decide next steps' },
		{ icon: Phone, text: 'They may contact you directly' },
		{ icon: Package, text: 'The job has been marked as Attempted' }
	] as const;
</script>

<div class="flex min-h-full flex-1 flex-col bg-white dark:bg-slate-900">
	<DriverJobSubpageTopNav title="Report Issue" backHref={backHref} />

	<div class="px-5 pt-2">
		<div class="flex h-11 items-center gap-2 rounded-[10px] bg-gray-100 px-4 dark:bg-slate-800">
			<ClipboardList
				size={16}
				class="shrink-0 text-slate-400"
				stroke-width={1.75}
				aria-hidden="true"
			/>
			<p class="font-inter min-w-0 truncate text-[13px] text-slate-400">
				<span class="font-['DM_Mono',ui-monospace,monospace] font-medium text-slate-400">
					Job {job.reference}
				</span>
				<span aria-hidden="true"> · </span>
				<span>{jobRefLabel}</span>
			</p>
		</div>
	</div>

	<div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4 pb-36">
		<div class="flex flex-col items-center gap-5 px-5 py-10 text-center">
			<div class="relative flex size-24 items-center justify-center" aria-hidden="true">
				<div class="absolute inset-0 rounded-full bg-[#d97706]/15"></div>
				<div
					class="relative flex size-[72px] items-center justify-center rounded-full bg-[#d97706] ring-4 ring-[#d97706]/20"
				>
					<AlertCircle size={36} class="text-white" stroke-width={2} />
				</div>
			</div>

			<h2 class="font-syne text-2xl font-extrabold text-gray-900 dark:text-slate-100">
				Issue reported
			</h2>
			<p class="font-inter max-w-[280px] text-sm leading-normal text-slate-400">
				Your operator has been notified about job {job.reference}
			</p>

			<div
				class="flex w-full flex-col gap-2.5 rounded-xl bg-gray-100 p-4 text-left dark:bg-slate-800"
			>
				{#each whatsNextItems as item (item.text)}
					<div class="flex items-start gap-2">
						<item.icon
							size={14}
							class="mt-0.5 shrink-0 text-slate-400"
							stroke-width={1.75}
							aria-hidden="true"
						/>
						<p class="font-inter text-[13px] leading-snug text-slate-400">{item.text}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div
		class="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-5 pt-4 pb-[34px] dark:border-slate-700 dark:bg-slate-900"
	>
		<a
			href="/jobs"
			class="font-syne mx-auto flex h-[52px] w-full max-w-[390px] items-center justify-center gap-2 rounded-[10px] border border-gray-200 text-[15px] font-bold text-gray-900 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
		>
			<ArrowLeft size={16} stroke-width={2} aria-hidden="true" />
			Back to my jobs
		</a>
	</div>
</div>
