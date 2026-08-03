<script lang="ts">
	import { onMount } from 'svelte';
	import CopyIcon from '$lib/components/operator/CopyIcon.svelte';
	import { jobDetailCardClass } from '$lib/components/operator/job-detail-ui';
	import Button from '$lib/components/ui/Button.svelte';
	import type {
		OperatorJobPod,
		OperatorJobPodSubmitted
	} from '$lib/types/operator-job-detail';
	import { formatJobDetailPodTimestamp } from '$lib/utils/operator-job-detail';
	import { Camera, Clock, Download, Link, ShieldCheck, User } from '@lucide/svelte';

	type Props = {
		jobId: string;
		pod: OperatorJobPod;
	};

	let { jobId, pod: initialPod }: Props = $props();

	let pod = $state(initialPod);
	let pollIntervalId = $state<number | null>(null);
	const cardClass = jobDetailCardClass;
	const isMockJob = $derived(jobId.startsWith('mock-'));
	const imageUrl = $derived(`/api/v1/jobs/${jobId}/pod/file`);
	const downloadUrl = $derived(`/api/v1/jobs/${jobId}/pod/download`);

	$effect(() => {
		pod = initialPod;
	});

	function isSubmitted(value: OperatorJobPod): value is OperatorJobPodSubmitted {
		return value.status === 'submitted';
	}

	function truncateHash(hash: string): string {
		if (hash.length <= 12) return hash;
		return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
	}

	async function copyRef(value: string) {
		try {
			await navigator.clipboard.writeText(value);
		} catch {
			// ignore
		}
	}

	async function pollBlockchainStatus() {
		try {
			const response = await fetch(`/api/v1/jobs/${jobId}/pod`, {
				credentials: 'same-origin'
			});
			if (!response.ok) return;

			const body = (await response.json()) as {
				pod: {
					blockchain_confirmed: boolean;
					blockchain_hash: string | null;
					blockchain_receipt: { solana_transaction_id: string | null } | null;
				} | null;
			};

			if (!body.pod || !isSubmitted(pod)) return;

			if (body.pod.blockchain_confirmed && body.pod.blockchain_hash) {
				pod = {
					...pod,
					blockchain_status: 'confirmed',
					blockchain_hash: body.pod.blockchain_hash,
					blockchain_ref: truncateHash(body.pod.blockchain_hash)
				};
				if (pollIntervalId !== null) {
					window.clearInterval(pollIntervalId);
					pollIntervalId = null;
				}
			}
		} catch {
			// ignore polling errors
		}
	}

	onMount(() => {
		if (!isSubmitted(pod) || pod.blockchain_status !== 'pending') {
			return;
		}

		const intervalId = window.setInterval(() => {
			if (isSubmitted(pod) && pod.blockchain_status === 'pending') {
				void pollBlockchainStatus();
			}
		}, 30_000);
		pollIntervalId = intervalId;

		return () => window.clearInterval(intervalId);
	});
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
		{#if isMockJob}
			<div
				class="mt-4 flex h-[220px] w-full items-center justify-center rounded-lg bg-gray-300 dark:bg-slate-700"
				role="img"
				aria-label="Proof of delivery preview placeholder"
			>
				<span class="font-inter text-xs text-gray-500 dark:text-slate-400">
					{pod.type === 'signature' ? 'Signature preview' : 'Photo preview'}
				</span>
			</div>
		{:else}
			<img
				src={imageUrl}
				alt={pod.type === 'signature' ? 'Proof of delivery signature' : 'Proof of delivery photo'}
				class="mt-4 h-[220px] w-full rounded-lg bg-gray-100 object-cover dark:bg-slate-800"
			/>
		{/if}

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
			<div class="flex w-full flex-col gap-2">
				<dt class="flex items-center gap-1.5 font-inter text-[13px] text-gray-500 dark:text-slate-400">
					<Link size={14} aria-hidden="true" />
					Blockchain ref
				</dt>
				{#if pod.blockchain_status === 'pending'}
					<dd>
						<p
							class="font-inter inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:border-[#422006] dark:bg-[#292524] dark:text-[#d97706]"
						>
							Blockchain receipt pending
						</p>
					</dd>
				{:else}
					<dd class="flex items-center justify-end gap-1">
						<span
							class="font-mono text-xs text-gray-500 dark:text-slate-400"
							style="font-family: 'DM Mono', ui-monospace, monospace"
						>
							{pod.blockchain_ref}
						</span>
						{#if pod.blockchain_hash}
							<button
								type="button"
								class="text-gray-400 transition-colors hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300"
								aria-label="Copy blockchain hash"
								onclick={() => copyRef(pod.blockchain_hash ?? pod.blockchain_ref)}
							>
								<CopyIcon />
							</button>
						{/if}
					</dd>
				{/if}
			</div>
		</dl>

		<div class="my-4 h-px bg-gray-200 dark:bg-slate-700"></div>

		<Button
			href={downloadUrl}
			variant="secondary"
			class="h-10 w-full gap-2 dark:border-slate-700 dark:bg-slate-800"
		>
			<Download size={14} aria-hidden="true" />
			Download PoD as PDF
		</Button>
	{/if}
</section>
