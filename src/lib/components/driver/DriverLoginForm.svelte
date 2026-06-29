<script lang="ts">
	import { page } from '$app/state';
	import DriverLoginBrand from '$lib/components/driver/DriverLoginBrand.svelte';
	import DriverLoginErrorBanner from '$lib/components/driver/DriverLoginErrorBanner.svelte';
	import DriverLoginPasswordField from '$lib/components/driver/DriverLoginPasswordField.svelte';
	import DriverTextField from '$lib/components/driver/DriverTextField.svelte';
	import { DRIVER_NOT_ACTIVATED_MESSAGE, loginWithPhoneCredentials } from '$lib/auth/login';
	import { initTheme, setTheme } from '$lib/stores/theme.svelte';
	import {
		DRIVER_LOGIN_AUTH_BANNER_MESSAGE,
		DRIVER_LOGIN_PASSWORD_AUTH_ERROR,
		DRIVER_LOGIN_PREVIEW_PASSWORD,
		DRIVER_LOGIN_PREVIEW_PHONE,
		isDriverLoginErrorPreview,
		isDriverLoginFilledPreview,
		isDriverLoginPreviewMode,
		resolveDriverLoginThemeHint
	} from '$lib/utils/driver-login-theme';
	import { SERVICE_UNAVAILABLE_MESSAGE } from '$lib/utils/error-page';

	const preview = $derived(page.url.searchParams.get('preview'));
	const isPreview = $derived(isDriverLoginPreviewMode(preview));
	const isFilledPreview = $derived(isDriverLoginFilledPreview(preview));
	const isErrorPreview = $derived(isDriverLoginErrorPreview(preview));

	let phone = $state('');
	let password = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let bannerError = $state('');
	let credentialError = $state(false);
	let submitting = $state(false);
	let showActivationHint = $state(false);

	const canSubmit = $derived(Boolean(phone.trim() && password && !submitting));

	const passwordError = $derived(
		fieldErrors.password ||
			(credentialError ? DRIVER_LOGIN_PASSWORD_AUTH_ERROR : '')
	);

	$effect(() => {
		const themeHint = resolveDriverLoginThemeHint(preview);
		if (themeHint === 'light') {
			setTheme('light');
			return;
		}
		if (themeHint === 'dark') {
			setTheme('dark');
			return;
		}
		initTheme();
	});

	$effect(() => {
		if (!isPreview) return;

		if (isFilledPreview) {
			if (!phone.trim()) phone = DRIVER_LOGIN_PREVIEW_PHONE;
			if (!password) password = DRIVER_LOGIN_PREVIEW_PASSWORD;
		}

		if (isErrorPreview) {
			bannerError = DRIVER_LOGIN_AUTH_BANNER_MESSAGE;
			credentialError = true;
		}
	});

	function validate() {
		const next: Record<string, string> = {};

		if (!phone.trim()) {
			next.phone = 'Mobile number is required';
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
		bannerError = '';
		credentialError = false;
		showActivationHint = false;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isPreview) return;

		clearFormError();

		if (!validate()) return;

		submitting = true;
		try {
			const result = await loginWithPhoneCredentials(
				phone,
				password,
				page.url.searchParams.get('redirect'),
				DRIVER_LOGIN_AUTH_BANNER_MESSAGE
			);

			if (!result.ok) {
				if (result.status === 401) {
					bannerError = DRIVER_LOGIN_AUTH_BANNER_MESSAGE;
					credentialError = true;
				} else {
					bannerError = result.message;
					showActivationHint =
						result.status === 403 || result.message === DRIVER_NOT_ACTIVATED_MESSAGE;
				}
			}
		} catch {
			bannerError = SERVICE_UNAVAILABLE_MESSAGE;
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex flex-1 flex-col">
	<main class="flex flex-1 flex-col px-5 pt-4 pb-6">
		<DriverLoginBrand class="w-full" />

		<h1 class="font-syne mt-6 text-[22px] font-bold text-gray-900 dark:text-slate-100">Welcome back</h1>
		<p class="font-inter mt-3 text-sm text-gray-500 dark:text-slate-400">Log in to see today's jobs</p>

		{#if bannerError}
			<DriverLoginErrorBanner class="mt-4" message={bannerError} />
		{/if}

		<form
			id="driver-login-form"
			class="mt-4 flex w-full max-w-[350px] flex-col gap-3"
			onsubmit={handleSubmit}
		>
			<DriverTextField
				name="phone"
				type="tel"
				label="Mobile number"
				placeholder="07700 900123"
				autocomplete="tel"
				required
				error={fieldErrors.phone}
				bind:value={phone}
				oninput={() => {
					clearFieldError('phone');
					clearFormError();
				}}
			/>
			<DriverLoginPasswordField
				name="password"
				label="Password"
				placeholder="Your password"
				autocomplete="current-password"
				required
				error={passwordError}
				invalid={credentialError && !fieldErrors.password}
				bind:value={password}
				oninput={() => {
					clearFieldError('password');
					clearFormError();
				}}
			/>

			{#if showActivationHint}
				<p class="font-inter text-sm text-gray-500 dark:text-slate-400">
					Invited?
					<a href="/activate" class="font-medium text-brand hover:underline"
						>Activate your account</a
					>
				</p>
			{/if}
		</form>
	</main>

	<div
		class="sticky bottom-0 border-t border-gray-200 bg-white px-5 pt-3 pb-[34px] dark:border-slate-700 dark:bg-slate-900"
	>
		<button
			type="submit"
			form="driver-login-form"
			class="font-syne mx-auto flex h-[52px] w-full max-w-[350px] items-center justify-center rounded-[10px] text-[15px] font-bold transition-colors disabled:cursor-not-allowed {canSubmit
				? 'bg-brand text-white hover:bg-[#178566]'
				: 'bg-gray-300 text-gray-500 dark:bg-slate-600 dark:text-slate-400'}"
			disabled={!canSubmit || submitting}
		>
			{submitting ? 'Logging in…' : 'Log in'}
		</button>
		<p class="font-inter mx-auto mt-3 max-w-[350px] text-center text-xs text-gray-500 dark:text-slate-400">
			Forgot password? Contact your operator.
		</p>
	</div>
</div>
