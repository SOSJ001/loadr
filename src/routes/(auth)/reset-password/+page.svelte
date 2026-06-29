<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AuthCard from '$lib/components/auth/AuthCard.svelte';
	import PasswordField from '$lib/components/auth/PasswordField.svelte';
	import PasswordStrength from '$lib/components/auth/PasswordStrength.svelte';
	import ResetPasswordTokenExpiredCard from '$lib/components/auth/ResetPasswordTokenExpiredCard.svelte';
	import ResetPasswordSuccessCard from '$lib/components/auth/ResetPasswordSuccessCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { SpecErrorResponse } from '$lib/types/api';

	type Props = {
		data: {
			hasRecoverySession: boolean;
		};
	};

	let { data }: Props = $props();

	let password = $state('');
	let confirmPassword = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formError = $state('');
	let submitting = $state(false);
	let accessToken = $state('');
	let tokenResolved = $state(false);
	let tokenExpired = $state(false);
	let succeeded = $state(false);
	let attempted = $state(false);

	const hasFieldErrors = $derived(Object.keys(fieldErrors).length > 0);
	const mismatchActive = $derived(
		attempted && fieldErrors.confirm_password === "Passwords don't match"
	);
	const mismatchLabelClass = $derived(
		mismatchActive ? 'text-gray-900 dark:text-slate-100' : ''
	);
	const linkExpired = $derived(page.url.searchParams.get('error') === 'expired');
	const showForm = $derived(data.hasRecoverySession || (tokenResolved && !tokenExpired));
	const showExpired = $derived(
		linkExpired || (tokenResolved && tokenExpired && !data.hasRecoverySession)
	);

	$effect(() => {
		if (typeof window === 'undefined') return;

		const code = page.url.searchParams.get('code');
		if (code) {
			const params = new URLSearchParams(page.url.searchParams);
			params.set('next', '/reset-password');
			void goto(`/auth/callback?${params.toString()}`, { replaceState: true });
			return;
		}

		if (data.hasRecoverySession) {
			tokenExpired = false;
			tokenResolved = true;
			return;
		}

		const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
		accessToken =
			hashParams.get('access_token') ?? page.url.searchParams.get('access_token') ?? '';

		if (linkExpired) {
			tokenExpired = true;
		} else {
			tokenExpired = !accessToken;
		}

		tokenResolved = true;
	});

	function validate() {
		const next: Record<string, string> = {};

		if (!password) {
			next.password = 'Password is required';
		} else if (password.length < 8) {
			next.password = 'Password must be at least 8 characters';
		}

		if (!confirmPassword) {
			next.confirm_password = 'Please confirm your password';
		} else if (password !== confirmPassword) {
			next.confirm_password = "Passwords don't match";
		}

		fieldErrors = next;
		return Object.keys(next).length === 0;
	}

	function showTokenExpired() {
		tokenExpired = true;
	}

	function handleFieldInput(field: 'password' | 'confirm_password') {
		if (attempted) {
			validate();
		} else if (fieldErrors[field]) {
			const { [field]: _, ...rest } = fieldErrors;
			fieldErrors = rest;
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		attempted = true;
		formError = '';
		if (!validate()) return;

		if (!accessToken && !data.hasRecoverySession) {
			showTokenExpired();
			return;
		}

		submitting = true;
		try {
			const body: { new_password: string; access_token?: string } = {
				new_password: password
			};
			if (accessToken) {
				body.access_token = accessToken;
			}

			const response = await fetch('/api/v1/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (response.ok) {
				succeeded = true;
				return;
			}

			let message = 'Something went wrong. Please try again.';
			let code = '';
			try {
				const responseData = (await response.json()) as SpecErrorResponse;
				code = responseData.error?.code ?? '';
				if (responseData.error?.message) message = responseData.error.message;
			} catch {
				// keep default message
			}

			if (response.status === 401 && code === 'TOKEN_EXPIRED') {
				showTokenExpired();
				return;
			}

			formError = message;
		} catch {
			formError = 'Something went wrong. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex w-full max-w-[440px] flex-col items-center gap-3 sm:gap-4">
	{#if succeeded}
		<ResetPasswordSuccessCard />
	{:else if showExpired}
		<ResetPasswordTokenExpiredCard />
	{:else if showForm}
		<AuthCard>
			<h1 class="font-syne text-[22px] font-bold text-gray-900 sm:text-2xl dark:text-slate-100">
				Set a new password
			</h1>
			<p
				class="text-center font-inter text-sm sm:text-left dark:text-slate-400 {mismatchActive
					? 'text-gray-900 sm:text-gray-500'
					: 'text-gray-500'}"
			>
				Choose a strong password for your account
			</p>

			<form class="flex w-full flex-col gap-2.5 sm:gap-3" method="POST" onsubmit={handleSubmit}>
				<div class="flex w-full flex-col gap-3">
					<PasswordField
						label="New password"
						labelClass={mismatchLabelClass}
						bind:value={password}
						placeholder="At least 8 characters"
						autocomplete="new-password"
						forgotHref={null}
						required
						error={fieldErrors.password}
						oninput={() => handleFieldInput('password')}
					/>

					<PasswordStrength {password} />

					<PasswordField
						name="confirm_password"
						label="Confirm new password"
						labelClass={mismatchLabelClass}
						placeholder="Repeat your password"
						autocomplete="new-password"
						forgotHref={null}
						bind:value={confirmPassword}
						required
						error={fieldErrors.confirm_password}
						oninput={() => handleFieldInput('confirm_password')}
					/>
				</div>

				{#if formError}
					<p class="font-inter text-sm text-red-600 dark:text-red-500" role="alert">
						{formError}
					</p>
				{/if}

				<div class="sm:pt-3">
					<Button
						type="submit"
						variant="brand"
						size="auth"
						class="w-full disabled:bg-gray-300 disabled:text-white disabled:opacity-100 dark:disabled:bg-slate-600"
						disabled={submitting || (attempted && hasFieldErrors)}
					>
						{submitting ? 'Updating…' : 'Update password'}
					</Button>
				</div>
			</form>
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
