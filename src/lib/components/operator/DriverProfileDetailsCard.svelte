<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import CopyIcon from '$lib/components/operator/CopyIcon.svelte';
	import DriverStatusBadge from '$lib/components/operator/DriverStatusBadge.svelte';
	import ResendInviteIcon from '$lib/components/operator/ResendInviteIcon.svelte';
	import type { DriverStatus } from '$lib/types/drivers';
	import { formatDriverProfileDate } from '$lib/utils/drivers';

	type Props = {
		fullName: string;
		phone: string;
		status: DriverStatus;
		addedAt: string;
		inviteLink?: string | null;
		mockResend?: boolean;
	};

	let { fullName, phone, status, addedAt, inviteLink = null, mockResend = false }: Props = $props();

	let submitting = $state(false);
	let resent = $state(false);
	let linkCopied = $state(false);
	let errorMessage = $state<string | null>(null);

	async function copyPhone() {
		try {
			await navigator.clipboard.writeText(phone);
		} catch {
			// Clipboard unavailable — ignore for UI preview
		}
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

	function markResent() {
		resent = true;
		setTimeout(() => {
			resent = false;
		}, 2500);
	}

	function handleMockResend(event: SubmitEvent) {
		event.preventDefault();
		if (submitting) return;
		submitting = true;
		setTimeout(() => {
			submitting = false;
			markResent();
		}, 400);
	}

	const handleResendEnhance: SubmitFunction = () => {
		submitting = true;
		errorMessage = null;

		return async ({ result, update }) => {
			submitting = false;

			if (result.type === 'success') {
				markResent();
			} else if (result.type === 'failure') {
				const data = result.data as { message?: string } | undefined;
				errorMessage = data?.message ?? 'Failed to resend invite.';
			}

			await update();
		};
	};
</script>

<section
	class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-slate-700 dark:bg-slate-800"
>
	<div class="flex items-center justify-between">
		<h2 class="font-syne text-base font-bold text-gray-900 dark:text-slate-100">Driver Details</h2>
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="none"
			class="text-gray-400 dark:text-slate-500"
			aria-hidden="true"
		>
			<circle cx="7" cy="4.5" r="2" stroke="currentColor" stroke-width="1.25" />
			<path
				d="M2.75 11.75c0-2.21 2.015-4 4.25-4s4.25 1.79 4.25 4"
				stroke="currentColor"
				stroke-width="1.25"
				stroke-linecap="round"
			/>
		</svg>
	</div>

	<div class="grid gap-6 sm:grid-cols-2">
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-1">
				<p
					class="font-inter text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400"
				>
					Full name
				</p>
				<p class="font-inter text-sm font-medium text-gray-900 dark:text-slate-100">{fullName}</p>
			</div>
			<div class="flex flex-col gap-1">
				<p
					class="font-inter text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400"
				>
					Mobile
				</p>
				<div class="flex items-center gap-1.5">
					<p class="font-inter text-sm font-medium text-gray-900 dark:text-slate-100">{phone}</p>
					<button
						type="button"
						class="shrink-0 text-gray-500 transition-colors hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
						aria-label="Copy phone number"
						title="Copy phone number"
						onclick={copyPhone}
					>
						<CopyIcon />
					</button>
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-1">
				<p
					class="font-inter text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400"
				>
					Status
				</p>
				<DriverStatusBadge {status} />
			</div>
			<div class="flex flex-col gap-1">
				<p
					class="font-inter text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400"
				>
					Added
				</p>
				<p class="font-inter text-sm font-medium text-gray-900 dark:text-slate-100">
					{formatDriverProfileDate(addedAt)}
				</p>
			</div>
		</div>
	</div>

	{#if status === 'pending'}
		<div class="flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-slate-700">
			<div class="flex flex-wrap items-center gap-2">
				<form
					method="POST"
					action="?/resend"
					onsubmit={mockResend ? handleMockResend : undefined}
					use:enhance={mockResend ? undefined : handleResendEnhance}
				>
					<button
						type="submit"
						class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 font-syne text-[13px] font-bold text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
						disabled={submitting}
					>
						<ResendInviteIcon />
						{resent ? 'Invite sent' : 'Resend invite'}
					</button>
				</form>
				<button
					type="button"
					class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 font-syne text-[13px] font-bold text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
					disabled={!inviteLink}
					title={inviteLink ?? 'No invite link available'}
					onclick={copyInviteLink}
				>
					<CopyIcon />
					{linkCopied ? 'Link copied' : 'Copy invite link'}
				</button>
			</div>
			{#if errorMessage}
				<p class="font-inter text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
			{/if}
		</div>
	{/if}
</section>
