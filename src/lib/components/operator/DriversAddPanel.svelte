<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import CopyIcon from '$lib/components/operator/CopyIcon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { buildDriverActivateUrl } from '$lib/utils/driver-invite';

	type PanelView = 'form' | 'success';

	type Props = {
		open?: boolean;
		companyName?: string;
		mockInvite?: boolean;
		previewSuccess?: boolean;
		previewInvitedName?: string;
		onclose?: () => void;
	};

	let {
		open = $bindable(false),
		companyName = 'Your company',
		mockInvite = false,
		previewSuccess = false,
		previewInvitedName = 'James Okafor',
		onclose
	}: Props = $props();

	let panelView = $state<PanelView>('form');
	let fullName = $state('');
	let phone = $state('');
	let invitedName = $state('');
	let inviteLink = $state<string | null>(null);
	let linkCopied = $state(false);
	let submitting = $state(false);
	let errorMessage = $state<string | null>(null);

	const inviteName = $derived.by(() => {
		const trimmed = fullName.trim();
		if (!trimmed) return 'James';
		return trimmed.split(/\s+/)[0] ?? trimmed;
	});

	const canSend = $derived(Boolean(fullName.trim() && phone.trim()));

	const smsPreview = $derived(
		`Hi ${inviteName}, ${companyName} has added you as a driver on Loadr. Tap here to activate your account: loadr.app/activate/...`
	);

	const successMessage = $derived(
		`${invitedName} will receive an SMS shortly with a link to activate their account`
	);

	function resetPanel() {
		panelView = 'form';
		fullName = '';
		phone = '';
		invitedName = '';
		inviteLink = null;
		linkCopied = false;
		errorMessage = null;
		submitting = false;
	}

	function close() {
		open = false;
		onclose?.();
		setTimeout(resetPanel, 250);
	}

	function handleOverlayClick() {
		close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			close();
		}
	}

	function handleMockSend(event: SubmitEvent) {
		event.preventDefault();
		if (!canSend || submitting) return;
		invitedName = fullName.trim();
		inviteLink = buildDriverActivateUrl(page.url.origin, 'preview-token');
		panelView = 'success';
	}

	async function copyInviteLink() {
		if (!inviteLink) return;

		try {
			await navigator.clipboard.writeText(inviteLink);
			linkCopied = true;
			window.setTimeout(() => {
				linkCopied = false;
			}, 2000);
		} catch {
			// Clipboard unavailable — ignore for UI preview
		}
	}

	const handleInviteEnhance: SubmitFunction = () => {
		submitting = true;
		errorMessage = null;

		return async ({ result, update }) => {
			submitting = false;

			if (result.type === 'success') {
				const data = result.data as
					| { invitedDriverName?: string; invite_link?: string | null }
					| undefined;
				invitedName = data?.invitedDriverName ?? fullName.trim();
				inviteLink = data?.invite_link ?? null;
				panelView = 'success';
				await invalidateAll();
			} else if (result.type === 'failure') {
				const data = result.data as { message?: string } | undefined;
				errorMessage = data?.message ?? 'Failed to send invite. Please try again.';
			}

			await update();
		};
	};

	function addAnother() {
		resetPanel();
	}

	$effect(() => {
		if (open && previewSuccess) {
			panelView = 'success';
			invitedName = previewInvitedName;
			inviteLink = buildDriverActivateUrl(page.url.origin, 'preview-token');
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="fixed inset-0 z-50 flex justify-end">
		<button
			type="button"
			class="absolute inset-0 bg-black/30"
			transition:fade={{ duration: 200 }}
			aria-label="Close add driver panel"
			onclick={handleOverlayClick}
		></button>

		<div
			class="relative flex h-full w-full max-w-[400px] flex-col border-l border-gray-200 bg-white p-8 shadow-[-4px_0_20px_rgba(0,0,0,0.08)] dark:border-slate-700 dark:bg-slate-900"
			role="dialog"
			aria-modal="true"
			aria-labelledby={panelView === 'form' ? 'add-driver-title' : 'invite-success-title'}
			in:fly={{ x: 400, duration: 300, easing: quintOut }}
			out:fly={{ x: 400, duration: 220, easing: quintOut }}
		>
			{#if panelView === 'form'}
				<div class="flex min-h-0 flex-1 flex-col gap-4" in:fade={{ duration: 180 }}>
					<div class="flex items-center justify-between">
						<h2
							id="add-driver-title"
							class="font-syne text-xl font-bold text-gray-900 dark:text-slate-100"
						>
							Add Driver
						</h2>
						<button
							type="button"
							class="flex size-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
							aria-label="Close add driver panel"
							onclick={close}
						>
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
								<path
									d="m3 3 8 8M11 3 3 11"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
								/>
							</svg>
						</button>
					</div>

					<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">
						We'll send them an SMS with a link to activate their account
					</p>

					<hr class="border-gray-200 dark:border-slate-700" />

					<form
						class="flex min-h-0 flex-1 flex-col gap-4"
						method="POST"
						action="?/invite"
						onsubmit={mockInvite ? handleMockSend : undefined}
						use:enhance={mockInvite ? undefined : handleInviteEnhance}
					>
						<div class="flex flex-col gap-1.5">
							<label
								for="driver-full-name"
								class="font-inter text-[13px] font-medium text-gray-500 dark:text-slate-400"
							>
								Full name
							</label>
							<div class="relative">
								<svg
									width="14"
									height="14"
									viewBox="0 0 14 14"
									fill="none"
									class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400 dark:text-slate-500"
									aria-hidden="true"
								>
									<path
										d="M7 7a2.75 2.75 0 1 0 0-5.5A2.75 2.75 0 0 0 7 7ZM2.75 12.25c0-2.21 2.015-4 4.25-4s4.25 1.79 4.25 4"
										stroke="currentColor"
										stroke-width="1.25"
										stroke-linecap="round"
									/>
								</svg>
								<input
									id="driver-full-name"
									name="full_name"
									type="text"
									placeholder="e.g. James Okafor"
									bind:value={fullName}
									class="font-inter h-11 w-full rounded-lg border border-gray-200 bg-white pr-3.5 pl-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</div>
						</div>

						<div class="flex flex-col gap-1.5">
							<label
								for="driver-phone"
								class="font-inter text-[13px] font-medium text-gray-500 dark:text-slate-400"
							>
								Mobile number
							</label>
							<div class="relative">
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400 dark:text-slate-500"
									aria-hidden="true"
								>
									<path
										d="M4.5 2.5h7a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"
										stroke="currentColor"
										stroke-width="1.5"
									/>
									<path
										d="M7 11.5h2"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
									/>
								</svg>
								<input
									id="driver-phone"
									name="phone"
									type="tel"
									placeholder="e.g. 07700 900123"
									bind:value={phone}
									class="font-inter h-11 w-full rounded-lg border border-gray-200 bg-white pr-3.5 pl-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
								/>
							</div>
							<p class="font-inter text-xs text-gray-500 dark:text-slate-400">
								Must be a UK mobile number
							</p>
						</div>

						<div class="rounded-[10px] bg-gray-100 p-4 dark:bg-slate-800">
							<p
								class="font-inter mb-2 text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400"
							>
								SMS preview
							</p>
							<div class="rounded-xl bg-gray-200 p-3 dark:bg-slate-700">
								<p class="font-inter text-[13px] leading-relaxed text-gray-900 dark:text-slate-100">
									{smsPreview}
								</p>
							</div>
							<p class="font-inter mt-2 text-[11px] text-gray-500 dark:text-slate-400">
								From: Loadr
							</p>
						</div>

						{#if errorMessage}
							<p
								class="font-inter rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
								role="alert"
							>
								{errorMessage}
							</p>
						{/if}

						<div class="mt-auto flex flex-col gap-3 pt-4">
							<hr class="border-gray-200 dark:border-slate-700" />
							<Button
								type="submit"
								variant="brand"
								class="w-full gap-2"
								disabled={!canSend || submitting}
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path
										d="M14 2 7 9M14 2l-4.5 12L7 9 2 7.5 14 2Z"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
								{submitting ? 'Sending…' : 'Send Invite'}
							</Button>
							<Button type="button" variant="secondary" class="w-full" onclick={close}>
								Cancel
							</Button>
						</div>
					</form>
				</div>
			{:else}
				<div
					class="flex flex-1 flex-col items-center justify-center gap-4 text-center"
					in:fade={{ duration: 180 }}
				>
					<div
						class="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50"
						aria-hidden="true"
					>
						<svg
							width="32"
							height="32"
							viewBox="0 0 32 32"
							fill="none"
							class="text-green-600 dark:text-green-400"
						>
							<circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2" />
							<path
								d="M10.5 16.5 14 20l7.5-8"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>

					<h2
						id="invite-success-title"
						class="font-inter text-xl font-bold text-gray-900 dark:text-slate-100"
					>
						Invite sent!
					</h2>

					<p class="font-inter max-w-[280px] text-sm leading-relaxed text-gray-500 dark:text-slate-400">
						{successMessage}
					</p>

					<div class="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
							<path
								d="M8 4.75V8l2 1.25"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<span class="font-inter text-[13px]">Invite expires in 48 hours</span>
					</div>

					<div class="mt-6 flex w-full max-w-[336px] flex-col items-center gap-3">
						<Button
							type="button"
							variant="secondary"
							class="w-full gap-2"
							disabled={!inviteLink}
							onclick={copyInviteLink}
						>
							<CopyIcon />
							{linkCopied ? 'Link copied' : 'Copy invite link'}
						</Button>
						<Button type="button" variant="secondary" class="w-full" onclick={addAnother}>
							Add another driver
						</Button>
						<button
							type="button"
							class="font-inter text-[13px] font-medium text-brand transition-colors hover:text-[#178566]"
							onclick={close}
						>
							Close
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
