<script lang="ts">
	import { goto } from '$app/navigation';
	import { Check } from '@lucide/svelte';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	type Props = {
		open?: boolean;
		jobId?: string;
		reference?: string;
		driverName?: string;
		onclose?: () => void;
	};

	let {
		open = $bindable(false),
		jobId = '',
		reference = '',
		driverName = '',
		onclose
	}: Props = $props();

	const message = $derived.by(() => {
		if (reference && driverName) {
			return `Job ${reference} has been successfully created and assigned to ${driverName}.`;
		}

		if (reference) {
			return `Job ${reference} has been successfully created.`;
		}

		return 'Your job has been successfully created.';
	});

	function close() {
		open = false;
		onclose?.();
	}

	function handleOverlayClick() {
		close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			close();
		}
	}

	function handleViewJob() {
		if (!jobId) return;
		open = false;
		void goto(`/jobs/${jobId}`);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			type="button"
			class="absolute inset-0 bg-gray-900/40 dark:bg-black/40"
			transition:fade={{ duration: 200 }}
			aria-label="Close job created dialog"
			onclick={handleOverlayClick}
		></button>

		<div
			class="relative flex w-full max-w-[420px] flex-col items-center gap-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_12px_16px_rgba(0,0,0,0.1)] dark:rounded-xl dark:border-slate-700 dark:bg-slate-800 dark:shadow-none"
			role="dialog"
			aria-modal="true"
			aria-labelledby="job-created-title"
			transition:scale={{ duration: 200, easing: quintOut, start: 0.96 }}
		>
			<div
				class="flex size-16 items-center justify-center rounded-full bg-brand"
				in:scale={{ duration: 220, delay: 80, start: 0.85, easing: quintOut }}
				aria-hidden="true"
			>
				<Check size={32} class="text-white" stroke-width={2.5} />
			</div>

			<div class="flex w-full flex-col items-center gap-2 text-center">
				<h2
					id="job-created-title"
					class="font-syne text-2xl font-bold text-gray-900 dark:text-xl dark:text-slate-100"
				>
					Job Created!
				</h2>

				<p
					class="font-inter text-sm leading-5 text-gray-500 dark:leading-6 dark:text-slate-400"
				>
					{message}
				</p>
			</div>

			<div class="flex w-full flex-col items-center gap-3">
				<button
					type="button"
					class="font-syne flex h-12 w-full items-center justify-center rounded-lg bg-brand text-sm font-bold text-white transition-colors hover:bg-[#178566] disabled:cursor-not-allowed disabled:opacity-50 dark:h-11 dark:text-[13px]"
					disabled={!jobId}
					onclick={handleViewJob}
				>
					View Job
				</button>
				<button
					type="button"
					class="font-inter text-sm font-semibold text-brand transition-colors hover:text-[#178566] dark:text-[13px]"
					onclick={close}
				>
					Create another job
				</button>
			</div>
		</div>
	</div>
{/if}
