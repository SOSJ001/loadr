<script lang="ts">
	import { page } from '$app/state';
	import AuthCard from '$lib/components/auth/AuthCard.svelte';
	import ForgotPasswordSuccessCard from '$lib/components/auth/ForgotPasswordSuccessCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let email = $state('');
	let submittedEmail = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let submitting = $state(false);
	let submitted = $state(false);

	function validate() {
		const next: Record<string, string> = {};

		if (!email.trim()) {
			next.email = 'Email address is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			next.email = 'Enter a valid email address';
		}

		fieldErrors = next;
		return Object.keys(next).length === 0;
	}

	function clearFieldError(field: string) {
		if (!fieldErrors[field]) return;
		const { [field]: _, ...rest } = fieldErrors;
		fieldErrors = rest;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!validate()) return;

		const trimmedEmail = email.trim();
		const redirectTo = `${page.url.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`;

		submitting = true;
		try {
			await fetch('/api/v1/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: trimmedEmail, redirect_to: redirectTo })
			});
		} catch {
			// API always returns success to avoid email enumeration.
		} finally {
			submitting = false;
			submittedEmail = trimmedEmail;
			submitted = true;
		}
	}
</script>

<div class="flex w-full max-w-[440px] flex-col items-center gap-3 sm:gap-4">
	{#if submitted}
		<ForgotPasswordSuccessCard email={submittedEmail} />
	{:else}
		<AuthCard>
			<h1 class="font-syne text-[22px] font-bold text-gray-900 sm:text-2xl dark:text-slate-100">
				Forgot your password?
			</h1>
			<p class="text-center font-inter text-sm text-gray-500 sm:text-left dark:text-slate-400">
				Enter your email and we'll send you a link to reset it
			</p>

			<form class="flex w-full flex-col gap-2.5 sm:gap-3" method="POST" onsubmit={handleSubmit}>
				<Input
					name="email"
					type="email"
					label="Email address"
					placeholder="you@yourcompany.com"
					autocomplete="email"
					required
					error={fieldErrors.email}
					bind:value={email}
					oninput={() => clearFieldError('email')}
				/>

				<div class="flex w-full flex-col gap-2.5 pt-2 sm:gap-3 sm:pt-3">
					<Button type="submit" variant="brand" size="auth" class="w-full" disabled={submitting}>
						{submitting ? 'Sending…' : 'Send reset link'}
					</Button>

					<div class="flex h-5 w-full items-center gap-2 sm:gap-3">
						<div class="h-px flex-1 bg-gray-200 dark:bg-slate-700"></div>
						<span class="font-inter text-xs text-gray-300 dark:text-slate-600">or</span>
						<div class="h-px flex-1 bg-gray-200 dark:bg-slate-700"></div>
					</div>

					<Button href="/login" variant="secondary" size="auth" class="w-full gap-1.5">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="M19 12H5m0 0 6-6m-6 6 6 6"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						Back to log in
					</Button>
				</div>
			</form>

			<div
				class="flex w-full flex-wrap items-center justify-center gap-1 pt-1.5 font-inter text-sm sm:justify-start sm:pt-2"
			>
				<span class="text-gray-500 dark:text-slate-400">Remembered your password?</span>
				<a href="/login" class="font-medium text-brand hover:underline">Log in</a>
			</div>
		</AuthCard>
	{/if}

	<p
		class="w-full max-w-[350px] text-center font-inter text-[11px] leading-normal text-gray-500 sm:max-w-[420px] dark:text-slate-400"
	>
		By logging in you agree to our
		<a
			href="/terms"
			class="underline underline-offset-2 hover:text-gray-700 dark:hover:text-slate-300"
			>Terms of Service</a
		>
		and
		<a
			href="/privacy"
			class="underline underline-offset-2 hover:text-gray-700 dark:hover:text-slate-300"
			>Privacy Policy</a
		>
	</p>
</div>
