<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AuthCard from '$lib/components/auth/AuthCard.svelte';
	import AuthErrorBanner from '$lib/components/auth/AuthErrorBanner.svelte';
	import CompanyManualEntryField from '$lib/components/auth/CompanyManualEntryField.svelte';
	import CompanySearchField from '$lib/components/auth/CompanySearchField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { SpecErrorResponse } from '$lib/types/api';

	import type { CompanyHouseResult } from '$lib/types/company-search';

	type CompanyEntryMode = 'search' | 'manual';

	const SIGNUP_ERROR_MESSAGE = 'Could not create your account. Please try again.';

	let companyEntryMode = $state<CompanyEntryMode>('search');
	let companySearch = $state('');
	let manualCompanyName = $state('');
	let selectedCompany = $state<CompanyHouseResult | null>(null);
	let companyDropdownOpen = $state(false);
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let errors = $state<Record<string, string>>({});
	let attempted = $state(false);
	let submitting = $state(false);
	let formError = $state('');

	const hasErrors = $derived(Object.keys(errors).length > 0);
	const isManualEntry = $derived(companyEntryMode === 'manual');
	const mismatchActive = $derived(
		attempted && errors.confirm_password === "Passwords don't match"
	);
	const confirmLabelClass = $derived(
		mismatchActive ? 'text-gray-900 dark:text-slate-100' : ''
	);
	const submitLabel = $derived(
		isManualEntry ? 'Create account — pending review' : 'Create account'
	);

	$effect(() => {
		const preview = page.url.searchParams.get('preview');
		if (preview === 'error') {
			companyEntryMode = 'search';
			companySearch = 'Acme Couriers Ltd';
			manualCompanyName = '';
			selectedCompany = null;
			companyDropdownOpen = false;
			email = 'invalid@';
			password = 'password1';
			confirmPassword = 'password2';
			attempted = true;
			errors = { confirm_password: "Passwords don't match" };
			return;
		}

		if (preview === 'search') {
			companyEntryMode = 'search';
			companySearch = 'dav';
			manualCompanyName = '';
			selectedCompany = null;
			companyDropdownOpen = true;
			attempted = false;
			errors = {};
			return;
		}

		if (preview === 'selected') {
			companyEntryMode = 'search';
			selectedCompany = {
				name: "DAVE'S COURIERS LTD",
				number: '12345678',
				status: 'active'
			};
			companySearch = selectedCompany.name;
			manualCompanyName = '';
			companyDropdownOpen = false;
			attempted = false;
			errors = {};
			return;
		}

		if (preview === 'manual') {
			companyEntryMode = 'manual';
			manualCompanyName = '';
			companySearch = '';
			selectedCompany = null;
			companyDropdownOpen = false;
			attempted = false;
			errors = {};
		}
	});

	function validate() {
		const next: Record<string, string> = {};

		if (isManualEntry) {
			if (!manualCompanyName.trim()) {
				next.company_name = 'Company name is required';
			}
		} else if (!selectedCompany) {
			next.company_search = 'Select your company from the list or use manual entry';
		} else if (selectedCompany.status === 'dissolved') {
			next.company_search = 'Cannot sign up with a dissolved company';
		}

		if (!email.trim()) {
			next.email = 'Email address is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			next.email = 'Enter a valid email address';
		}

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

		errors = next;
		return Object.keys(next).length === 0;
	}

	function handleFieldInput(field: string) {
		if (attempted) {
			validate();
		} else if (errors[field]) {
			const { [field]: _, ...rest } = errors;
			errors = rest;
		}
	}

	function clearFormError() {
		formError = '';
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		attempted = true;
		formError = '';

		if (!validate()) return;

		const trimmedEmail = email.trim();
		const company = isManualEntry
			? { mode: 'manual' as const, company_name: manualCompanyName.trim() }
			: { mode: 'search' as const, companies_house_number: selectedCompany!.number };

		submitting = true;
		try {
			const response = await fetch('/api/v1/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: trimmedEmail,
					password,
					company
				})
			});

			if (response.ok) {
				// Email verification flow (re-enable when ready):
				// const data = (await response.json()) as { email_confirmation_required?: boolean };
				// if (data.email_confirmation_required) {
				// 	await goto(`/verify-email?email=${encodeURIComponent(trimmedEmail)}`);
				// 	return;
				// }
				await goto('/dashboard');
				return;
			}

			let message = SIGNUP_ERROR_MESSAGE;
			try {
				const data = (await response.json()) as SpecErrorResponse;
				if (data.error?.message) {
					message = data.error.message;
					if (data.error.code === 'VALIDATION_ERROR') {
						if (message.toLowerCase().includes('company name')) {
							errors = { ...errors, company_name: message };
							return;
						}
						if (message.toLowerCase().includes('company')) {
							errors = { ...errors, company_search: message };
							return;
						}
						if (message.toLowerCase().includes('email')) {
							errors = { ...errors, email: message };
							return;
						}
						if (message.toLowerCase().includes('password')) {
							errors = { ...errors, password: message };
							return;
						}
					}
				}
			} catch {
				// keep default message
			}
			formError = message;
		} catch {
			formError = SIGNUP_ERROR_MESSAGE;
		} finally {
			submitting = false;
		}
	}

	function handleManualEntry() {
		companyEntryMode = 'manual';
		selectedCompany = null;
		companySearch = '';
		companyDropdownOpen = false;
		if (errors.company_search) {
			const { company_search: _, ...rest } = errors;
			errors = rest;
		}
	}

	function handleSearchAgain() {
		companyEntryMode = 'search';
		manualCompanyName = '';
		if (errors.company_name) {
			const { company_name: _, ...rest } = errors;
			errors = rest;
		}
	}
</script>

<div class="flex w-full max-w-[440px] flex-col items-center gap-3 sm:gap-4">
	<AuthCard>
		<h1 class="font-syne text-[22px] font-bold text-gray-900 sm:text-2xl dark:text-slate-100">
			Get started free
		</h1>
		{#if !attempted || !hasErrors}
			<p class="w-full font-inter text-sm text-gray-500 dark:text-slate-400">
				Manage your deliveries in one place
			</p>
		{/if}

		{#if formError}
			<AuthErrorBanner message={formError} />
		{/if}

		<form class="flex w-full flex-col gap-2.5 sm:gap-3" method="POST" onsubmit={handleSubmit}>
			{#if isManualEntry}
				<CompanyManualEntryField
					name="company_name"
					required
					error={errors.company_name}
					bind:value={manualCompanyName}
					oninput={() => handleFieldInput('company_name')}
					onSearchAgain={handleSearchAgain}
				/>
			{:else}
				<CompanySearchField
					name="company_search"
					required
					error={errors.company_search}
					bind:value={companySearch}
					bind:selected={selectedCompany}
					bind:dropdownOpen={companyDropdownOpen}
					oninput={() => handleFieldInput('company_search')}
					onManualEntry={handleManualEntry}
					onClearSelection={() => handleFieldInput('company_search')}
				/>
			{/if}
			<Input
				name="email"
				type="email"
				label="Email address"
				placeholder="you@yourcompany.com"
				autocomplete="email"
				required
				error={errors.email}
				bind:value={email}
				oninput={() => {
					clearFormError();
					handleFieldInput('email');
				}}
			/>
			<Input
				name="password"
				type="password"
				label="Password"
				placeholder="At least 8 characters"
				autocomplete="new-password"
				required
				error={errors.password}
				bind:value={password}
				oninput={() => handleFieldInput('password')}
			/>
			<Input
				name="confirm_password"
				type="password"
				label="Confirm password"
				placeholder="Repeat your password"
				autocomplete="new-password"
				required
				error={errors.confirm_password}
				labelClass={confirmLabelClass}
				bind:value={confirmPassword}
				oninput={() => handleFieldInput('confirm_password')}
			/>

			<Button
				type="submit"
				variant="brand"
				size="auth"
				class="w-full {isManualEntry ? 'px-2 text-center' : ''}"
				disabled={submitting}
			>
				{submitting ? 'Creating account…' : submitLabel}
			</Button>
		</form>

		<div class="flex h-5 w-full items-center gap-3">
			<div class="h-px flex-1 bg-gray-200 dark:bg-slate-700"></div>
			<span class="font-inter text-xs text-gray-300 dark:text-slate-600">or</span>
			<div class="h-px flex-1 bg-gray-200 dark:bg-slate-700"></div>
		</div>

		<Button type="button" variant="secondary" size="auth" class="w-full">
			Continue with Google
		</Button>

		<p class="w-full font-inter text-sm text-gray-500 dark:text-slate-400">
			Already have an account?
			<a href="/login" class="font-medium text-brand hover:underline">Log in</a>
		</p>
	</AuthCard>

	<p
		class="w-full max-w-[350px] text-center font-inter text-[11px] leading-[1.5] text-gray-500 sm:max-w-[420px] sm:leading-normal dark:text-slate-400"
	>
		By creating an account you agree to our
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
