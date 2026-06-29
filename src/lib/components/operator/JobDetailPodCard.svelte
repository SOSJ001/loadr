<script lang="ts">
	import CopyIcon from '$lib/components/operator/CopyIcon.svelte';
	import { jobDetailCardClass } from '$lib/components/operator/job-detail-ui';
	import Button from '$lib/components/ui/Button.svelte';
	import type { OperatorJobPod } from '$lib/types/operator-job-detail';
	import { formatJobDetailPodTimestamp } from '$lib/utils/operator-job-detail';
	import { Camera, Clock, Download, Link, ShieldCheck, User } from '@lucide/svelte';

	type Props = {
		pod: OperatorJobPod;
	};

	let { pod }: Props = $props();

	const cardClass = jobDetailCardClass;

	async function copyRef(ref: string) {
		try {
			await navigator.clipboard.writeText(ref);
		} catch {
			// ignore
		}
	}
</script>

<section class={cardClass}>
	<div class="flex items-center justify-between">
		<h2 class="font-syne text-base font-bold text-gray-900 dark:text-slate-100">
			Proof of Delivery
		</h2>
		<ShieldCheck size={18} class="text-brand" aria-hidden="true" />
	</div>

	{#if pod.status === 'awaiting'}
		<div
			class="mt-4 flex h-[220px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-100 dark:border-slate-600 dark:bg-slate-800"
		>
			<Camera size={32} class="text-gray-400 dark:text-slate-500" aria-hidden="true" />
			<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">
				Awaiting proof of delivery
			</p>
		</div>
	{:else}
		<div
			class="mt-4 h-[220px] w-full rounded-lg bg-gray-300"
			role="img"
			aria-label="Proof of delivery photo placeholder"
		></div>

		<dl class="mt-4 w-full space-y-3">
			<div class="flex w-full items-center justify-between gap-4">
				<dt class="flex items-center gap-1.5 font-inter text-[13px] text-gray-500 dark:text-slate-400">
					<User size={14} aria-hidden="true" />
					Completed by
				</dt>
				<dd class="font-inter text-[13px] font-medium text-gray-900 dark:text-slate-100">
					{pod.completed_by}
				</dd>
			</div>
			<div class="flex w-full items-center justify-between gap-4">
				<dt class="flex items-center gap-1.5 font-inter text-[13px] text-gray-500 dark:text-slate-400">
					<Clock size={16} aria-hidden="true" />
					Timestamp
				</dt>
				<dd class="font-inter text-[13px] font-medium text-gray-900 dark:text-slate-100">
					{formatJobDetailPodTimestamp(pod.timestamp)}
				</dd>
			</div>
			<div class="flex w-full items-center justify-between gap-4">
				<dt class="flex items-center gap-1.5 font-inter text-[13px] text-gray-500 dark:text-slate-400">
					<Link size={14} aria-hidden="true" />
					Blockchain ref
				</dt>
				<dd class="flex items-center gap-1">
					<span
						class="font-mono text-xs text-gray-500 dark:text-slate-400"
						style="font-family: 'DM Mono', ui-monospace, monospace"
					>
						{pod.blockchain_ref}
					</span>
					<button
						type="button"
						class="text-gray-400 transition-colors hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300"
						aria-label="Copy blockchain reference"
						onclick={() => copyRef(pod.blockchain_ref)}
					>
						<CopyIcon />
					</button>
				</dd>
			</div>
		</dl>

		<div class="my-4 h-px bg-gray-200 dark:bg-slate-700"></div>

		<Button variant="secondary" class="h-10 w-full gap-2 dark:border-slate-700 dark:bg-slate-800">
			<Download size={14} aria-hidden="true" />
			Download PoD as PDF
		</Button>
	{/if}
</section>
