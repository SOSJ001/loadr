<script lang="ts">
	import AuthCard from '$lib/components/auth/AuthCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	type ResendState = 'idle' | 'resent' | 'countdown';

	type Props = {
		email?: string;
	};

	let { email = 'dave@davescouriers.co.uk' }: Props = $props();

	let resendState = $state<ResendState>('idle');
	let countdown = $state(0);

	let countdownTimer: ReturnType<typeof setInterval> | undefined;
	let resentTimer: ReturnType<typeof setTimeout> | undefined;

	function clearTimers() {
		if (countdownTimer) clearInterval(countdownTimer);
		if (resentTimer) clearTimeout(resentTimer);
		countdownTimer = undefined;
		resentTimer = undefined;
	}

	function startCountdown(seconds = 60) {
		resendState = 'countdown';
		countdown = seconds;
		countdownTimer = setInterval(() => {
			countdown -= 1;
			if (countdown <= 0) {
				clearTimers();
				resendState = 'idle';
			}
		}, 1000);
	}

	function handleResend() {
		if (resendState !== 'idle') return;

		resendState = 'resent';
		resentTimer = setTimeout(() => startCountdown(), 2500);
	}

	$effect(() => {
		return () => clearTimers();
	});
</script>

<AuthCard variant="centered" class="gap-2.5 sm:gap-3">
	<div class="flex w-full flex-col items-center gap-2.5 sm:gap-3">
		<div class="flex h-20 w-full items-center justify-center" aria-hidden="true">
			<div
				class="flex size-20 items-center justify-center rounded-full border-[1.5px] border-brand text-brand"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="36"
					height="36"
					viewBox="0 0 24 24"
					fill="none"
				>
					<path
						d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
		</div>

		<h1
			class="w-full text-center font-syne text-[22px] font-bold text-gray-900 sm:text-2xl dark:text-white"
		>
			Check your email
		</h1>

		<p class="w-full text-center font-inter text-sm text-gray-500 dark:text-slate-400">
			We've sent a verification link to
		</p>
		<p
			class="w-full break-words text-center font-inter text-sm font-medium text-gray-900 dark:text-white"
		>
			{email}
		</p>
		<p
			class="w-full text-center font-inter text-sm leading-normal text-gray-500 dark:text-slate-400"
		>
			Click the link in the email to activate your account and get started.
		</p>

		<Button href="mailto:" variant="brand" size="auth" class="w-full gap-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
			>
				<path
					d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			Open email app
		</Button>

		<div class="h-px w-full bg-gray-200 dark:bg-slate-700" aria-hidden="true"></div>

		<p class="w-full text-center font-inter text-xs text-gray-300 dark:text-slate-600">
			Didn't receive the email?
		</p>

		{#if resendState === 'idle'}
			<div class="flex h-5 w-full items-center justify-center gap-2 font-inter text-xs">
				<button
					type="button"
					class="font-medium text-brand hover:underline"
					onclick={handleResend}
				>
					Resend email
				</button>
				<span class="text-gray-300 dark:text-slate-600">·</span>
				<span class="font-medium text-brand">Check spam folder</span>
			</div>
		{:else if resendState === 'resent'}
			<div
				class="flex h-4 w-full items-center justify-center gap-1.5 font-inter text-xs text-brand"
				role="status"
				aria-live="polite"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					aria-hidden="true"
					class="shrink-0"
				>
					<path
						d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span class="font-normal">Email resent — check your inbox</span>
			</div>
		{:else}
			<p
				class="w-full text-center font-inter text-xs font-medium text-gray-300 dark:text-slate-600"
			>
				Resend email
			</p>
			<p class="w-full text-center font-inter text-xs text-gray-300 dark:text-slate-600">
				You can resend in {countdown}s
			</p>
		{/if}

		<p class="w-full text-center font-inter text-xs text-gray-300 dark:text-slate-600">
			Wrong email address?
		</p>

		<div class="flex h-5 w-full items-center justify-center">
			<a href="/signup" class="font-inter text-xs font-medium text-brand hover:underline">
				Go back and edit
			</a>
		</div>
	</div>
</AuthCard>
