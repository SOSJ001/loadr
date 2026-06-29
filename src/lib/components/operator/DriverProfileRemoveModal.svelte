<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import DriverStatusBadge from '$lib/components/operator/DriverStatusBadge.svelte';
	import type { DriverStatus } from '$lib/types/drivers';
	import { driverInitials } from '$lib/utils/dashboard';

	type Props = {
		open?: boolean;
		fullName: string;
		status: DriverStatus;
		mockRemove?: boolean;
		onclose?: () => void;
	};

	let { open = $bindable(false), fullName, status, mockRemove = false, onclose }: Props = $props();

	const firstName = $derived(fullName.split(/\s+/).filter(Boolean)[0] ?? fullName);
	const confirmPhrase = $derived(`delete ${fullName}`);

	let confirmInput = $state('');
	let submitting = $state(false);
	let errorMessage = $state<string | null>(null);

	const canRemove = $derived(confirmInput === confirmPhrase);

	function close() {
		if (submitting) return;
		open = false;
		confirmInput = '';
		errorMessage = null;
		onclose?.();
	}

	function handleOverlayClick() {
		close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open && !submitting) {
			close();
		}
	}

	function handleMockRemove(event: SubmitEvent) {
		event.preventDefault();
		if (submitting || !canRemove) return;
		submitting = true;
		setTimeout(async () => {
			submitting = false;
			open = false;
			await goto('/drivers');
		}, 400);
	}

	const handleRemoveEnhance: SubmitFunction = () => {
		submitting = true;
		errorMessage = null;

		return async ({ result, update }) => {
			submitting = false;

			if (result.type === 'failure') {
				const data = result.data as { message?: string } | undefined;
				errorMessage = data?.message ?? 'Failed to remove driver.';
				await update();
				return;
			}

			open = false;
			await update();
		};
	};
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			type="button"
			class="absolute inset-0 bg-black/40"
			transition:fade={{ duration: 200 }}
			aria-label="Close remove driver dialog"
			onclick={handleOverlayClick}
		></button>

		<div
			class="relative flex w-full max-w-[440px] flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
			role="dialog"
			aria-modal="true"
			aria-labelledby="remove-driver-title"
			transition:scale={{ duration: 200, easing: quintOut, start: 0.96 }}
		>
			<div
				class="flex size-12 items-center justify-center rounded-3xl bg-brand font-inter text-[13px] font-semibold text-white"
				aria-hidden="true"
			>
				{driverInitials(fullName)}
			</div>

			<p class="font-inter text-lg font-bold text-gray-900 dark:text-gray-50">{fullName}</p>

			<DriverStatusBadge {status} />

			<div class="my-1 h-px w-full max-w-[376px] bg-gray-200 dark:bg-slate-700" aria-hidden="true"></div>

			<svg
				width="32"
				height="32"
				viewBox="0 0 32 32"
				fill="none"
				class="text-amber-500"
				aria-hidden="true"
			>
				<path
					d="M16 4.5 28.5 27.5H3.5L16 4.5Z"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linejoin="round"
				/>
				<path
					d="M16 12.5v7.5M16 23.25h.01"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linecap="round"
				/>
			</svg>

			<h2
				id="remove-driver-title"
				class="font-inter text-lg font-bold text-gray-900 dark:text-gray-50"
			>
				Remove {fullName}?
			</h2>

			<p
				class="max-w-[320px] text-center font-inter text-sm leading-relaxed text-gray-500 dark:text-gray-400"
			>
				This will remove {firstName} from your driver list and revoke their app access. Their job
				history will be preserved.
			</p>

			<form
				method="POST"
				action="?/remove"
				class="mt-2 flex w-full max-w-[376px] flex-col gap-2"
				onsubmit={mockRemove ? handleMockRemove : undefined}
				use:enhance={mockRemove ? undefined : handleRemoveEnhance}
			>
				<div class="flex w-full flex-col gap-1.5">
					<label
						for="remove-driver-confirm"
						class="font-inter text-xs font-medium text-gray-500 dark:text-gray-400"
					>
						Type "{confirmPhrase}" to delete
					</label>
					<input
						id="remove-driver-confirm"
						name="confirm_text"
						type="text"
						autocomplete="off"
						spellcheck="false"
						placeholder={confirmPhrase}
						bind:value={confirmInput}
						class="font-inter h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-300 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-gray-400 dark:placeholder:text-gray-400"
					/>
				</div>

				{#if errorMessage}
					<p
						class="font-inter rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
						role="alert"
					>
						{errorMessage}
					</p>
				{/if}

				<button
					type="button"
					class="flex h-11 w-full items-center justify-center rounded-lg border border-gray-200 bg-white font-syne text-[13px] font-bold text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-50 dark:hover:bg-slate-700"
					disabled={submitting}
					onclick={close}
				>
					Cancel
				</button>
				<button
					type="submit"
					class="flex h-11 w-full items-center justify-center rounded-lg border border-red-600 bg-white font-syne text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-600 dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
					disabled={submitting || !canRemove}
				>
					{submitting ? 'Removing…' : 'Yes, remove driver'}
				</button>
			</form>
		</div>
	</div>
{/if}
