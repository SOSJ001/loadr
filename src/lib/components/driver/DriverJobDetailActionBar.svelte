<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { AlertCircle, CircleCheck, Play } from '@lucide/svelte';
	import { isOffline } from '$lib/offline/init';
	import { queueStartJob } from '$lib/offline/queue';
	import type { DriverJobDetailAction } from '$lib/types/driver-job-detail';

	type Props = {
		jobId: string;
		primaryAction: DriverJobDetailAction | null;
		secondaryActions?: DriverJobDetailAction[];
		preview?: boolean;
		formError?: string | null;
	};

	let {
		jobId,
		primaryAction,
		secondaryActions = [],
		preview = false,
		formError = null
	}: Props = $props();

	let submitting = $state(false);

	const reportIssueAction = $derived(
		secondaryActions.find((action) => action.kind === 'report_issue')
	);
</script>

{#if primaryAction || secondaryActions.length > 0}
	<div
		class="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-5 pt-4 pb-[34px] dark:border-slate-700 dark:bg-slate-900"
	>
		<div class="mx-auto flex w-full max-w-[390px] flex-col">
			{#if formError}
				<p class="font-inter mb-2.5 text-center text-xs text-red-600 dark:text-red-400">{formError}</p>
			{/if}

			{#if primaryAction?.hint}
				<p class="font-inter text-center text-xs text-gray-500 dark:text-slate-400">{primaryAction.hint}</p>
			{/if}

			{#if primaryAction?.hint}
				<div class="h-2.5" aria-hidden="true"></div>
			{/if}

			{#if primaryAction?.kind === 'start'}
				<form
					method="POST"
					action="?/startJob"
					use:enhance={({ cancel }) => {
						if (isOffline()) {
							cancel();
							submitting = true;
							void queueStartJob(jobId)
								.then(() => goto(`/jobs/${jobId}/started?fresh=1&offline=1`))
								.finally(() => {
									submitting = false;
								});
							return;
						}

						submitting = true;
						return async ({ update }) => {
							submitting = false;
							await update();
						};
					}}
				>
					<button
						type="submit"
						class="font-syne flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
						disabled={submitting || preview}
					>
						<Play size={18} fill="currentColor" aria-hidden="true" />
						{primaryAction.label}
					</button>
				</form>
			{:else if primaryAction?.kind === 'complete' && primaryAction.href}
				<a
					href={primaryAction.href}
					class="font-syne flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-bold text-white transition-opacity hover:opacity-90"
				>
					<CircleCheck size={18} stroke-width={2} aria-hidden="true" />
					{primaryAction.label}
				</a>
			{:else if primaryAction?.href}
				<a
					href={primaryAction.href}
					class="font-syne flex h-[52px] w-full items-center justify-center rounded-[10px] bg-brand text-[15px] font-bold text-white transition-opacity hover:opacity-90"
				>
					{primaryAction.label}
				</a>
			{/if}

			{#if reportIssueAction?.href}
				<div class="h-2" aria-hidden="true"></div>
				<a
					href={reportIssueAction.href}
					class="font-syne flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-gray-200 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
				>
					<AlertCircle size={16} stroke-width={2} aria-hidden="true" />
					{reportIssueAction.label}
				</a>
			{/if}
		</div>
	</div>
{/if}
