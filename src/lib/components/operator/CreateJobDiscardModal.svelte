<script lang="ts">
	import { goto } from '$app/navigation';
	import { AlertTriangle } from '@lucide/svelte';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	type Props = {
		open?: boolean;
		leaveHref?: string;
		onclose?: () => void;
	};

	let { open = $bindable(false), leaveHref = '/jobs', onclose }: Props = $props();

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

	function handleDiscard() {
		open = false;
		void goto(leaveHref);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			type="button"
			class="absolute inset-0 bg-black/40"
			transition:fade={{ duration: 200 }}
			aria-label="Close discard changes dialog"
			onclick={handleOverlayClick}
		></button>

		<div
			class="relative flex w-full max-w-[400px] flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
			role="dialog"
			aria-modal="true"
			aria-labelledby="discard-changes-title"
			transition:scale={{ duration: 200, easing: quintOut, start: 0.96 }}
		>
			<AlertTriangle size={32} class="text-amber-500" aria-hidden="true" />

			<h2
				id="discard-changes-title"
				class="font-inter text-lg font-bold text-gray-900 dark:text-slate-100"
			>
				Discard changes?
			</h2>

			<p class="max-w-[336px] text-center font-inter text-sm text-gray-500 dark:text-slate-400">
				You have unsaved changes. If you go back now they will be lost.
			</p>

			<div class="mt-1 flex w-full max-w-[336px] flex-col gap-2">
				<button
					type="button"
					class="flex h-11 w-full items-center justify-center rounded-lg border border-gray-200 bg-white font-syne text-[13px] font-bold text-gray-900 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
					onclick={close}
				>
					Keep editing
				</button>
				<button
					type="button"
					class="flex h-11 w-full items-center justify-center rounded-lg border border-red-600 bg-white font-syne text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-600 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
					onclick={handleDiscard}
				>
					Discard and go back
				</button>
			</div>
		</div>
	</div>
{/if}
