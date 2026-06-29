<script lang="ts">
	import { page } from '$app/state';
	import AuthCard from '$lib/components/auth/AuthCard.svelte';
	import AuthErrorBanner from '$lib/components/auth/AuthErrorBanner.svelte';
	import AuthSuccessBanner from '$lib/components/auth/AuthSuccessBanner.svelte';
	import PasswordField from '$lib/components/auth/PasswordField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { loginWithCredentials } from '$lib/auth/login';
	import { SERVICE_UNAVAILABLE_MESSAGE } from '$lib/utils/error-page';

	const AUTH_ERROR_MESSAGE = 'Incorrect email or password. Please try again.';
	const EMAIL_CONFIRMED_MESSAGE = 'Email confirmed. Please log in.';
	const PASSWORD_RESET_MESSAGE = 'Password updated. You can log in with your new password.';
	const EMAIL_CONFIRMATION_ERROR_MESSAGE =
		'That confirmation link is invalid or has expired. Please try again or sign up.';

	let email = $state('');
	let password = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formError = $state('');
	let submitting = $state(false);

	const emailConfirmed = $derived(page.url.searchParams.get('confirmed') === 'email');
	const passwordReset = $derived(page.url.searchParams.get('reset') === 'success');
	const emailConfirmationError = $derived(
		page.url.searchParams.get('error') === 'email_confirmation'
	);

	$effect(() => {
		const prefill = page.url.searchParams.get('email');
		if (prefill && !email.trim()) {
			email = prefill;
		}
	});

	function validate() {
		const next: Record<string, string> = {};

		if (!email.trim()) {
			next.email = 'Email address is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			next.email = 'Enter a valid email address';
		}

		if (!password) {
			next.password = 'Password is required';
		}

		fieldErrors = next;
		return Object.keys(next).length === 0;
	}

	function clearFieldError(field: string) {
		if (!fieldErrors[field]) return;
		const { [field]: _, ...rest } = fieldErrors;
		fieldErrors = rest;
	}

	function clearFormError() {
		formError = '';
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		formError = '';

		if (!validate()) return;

		submitting = true;
		try {
			const result = await loginWithCredentials(
				email,
				password,
				page.url.searchParams.get('redirect'),
				AUTH_ERROR_MESSAGE
			);

			if (!result.ok) {
				formError = result.message;
			}
		} catch {
			formError = SERVICE_UNAVAILABLE_MESSAGE;
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex w-full max-w-[440px] flex-col items-center gap-3 sm:gap-4">
	<AuthCard>
		<h1 class="font-syne text-[22px] font-bold text-gray-900 sm:text-2xl dark:text-slate-100">
			Welcome back
		</h1>
		<p class="font-inter text-sm text-gray-500 dark:text-slate-400">
			Log in to manage your deliveries
		</p>

		{#if emailConfirmed}
			<AuthSuccessBanner message={EMAIL_CONFIRMED_MESSAGE} />
		{:else if passwordReset}
			<AuthSuccessBanner message={PASSWORD_RESET_MESSAGE} />
		{:else if emailConfirmationError}
			<AuthErrorBanner message={EMAIL_CONFIRMATION_ERROR_MESSAGE} />
		{/if}

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
				oninput={() => {
					clearFieldError('email');
					clearFormError();
				}}
			/>
			<PasswordField
				bind:value={password}
				required
				error={fieldErrors.password}
				oninput={() => {
					clearFieldError('password');
					clearFormError();
				}}
			/>

			{#if formError}
				<AuthErrorBanner message={formError} />
			{/if}

			<Button type="submit" variant="brand" size="auth" class="w-full" disabled={submitting}>
				{submitting ? 'Logging in…' : 'Log in'}
			</Button>
		</form>

		<div class="flex h-5 w-full items-center gap-3">
			<div class="h-px flex-1 bg-gray-200 dark:bg-slate-700"></div>
			<span class="font-inter text-xs text-gray-300 dark:text-slate-600">or</span>
			<div class="h-px flex-1 bg-gray-200 dark:bg-slate-700"></div>
		</div>

		<Button
			type="button"
			variant="secondary"
			size="auth"
			class="w-full dark:!border-slate-700 dark:!bg-slate-800 dark:!text-slate-100 dark:hover:!border-slate-600 dark:hover:!bg-slate-700"
		>
			Continue with Google
		</Button>

		<p class="w-full text-center font-inter text-sm text-gray-500 dark:text-slate-400">
			Are you a driver?
			<a href="/login/driver" class="font-medium text-brand hover:underline">Driver log in</a>
		</p>

		<p class="w-full text-center font-inter text-sm text-gray-500 dark:text-slate-400">
			Don't have an account?
			<a href="/signup" class="font-medium text-brand hover:underline">Sign up free</a>
		</p>
	</AuthCard>

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
