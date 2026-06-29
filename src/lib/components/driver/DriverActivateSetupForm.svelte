<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Lock } from '@lucide/svelte';
	import DriverActivateProgress from '$lib/components/driver/DriverActivateProgress.svelte';
	import DriverActivateTopNav from '$lib/components/driver/DriverActivateTopNav.svelte';
	import DriverPasswordField from '$lib/components/driver/DriverPasswordField.svelte';
	import DriverPasswordMatch from '$lib/components/driver/DriverPasswordMatch.svelte';
	import DriverPasswordMismatch from '$lib/components/driver/DriverPasswordMismatch.svelte';
	import DriverPasswordStrength from '$lib/components/driver/DriverPasswordStrength.svelte';

	type FieldErrors = {
		password?: string;
		confirm_password?: string;
	};

	type Props = {
		token: string;
		backHref: string;
		error?: string;
		preview?: boolean;
		setupPasswordSeed?: string | null;
		setupFieldErrors?: FieldErrors | null;
		setupAttempted?: boolean;
	};

	let {
		token,
		backHref,
		error = '',
		preview = false,
		setupPasswordSeed = null,
		setupFieldErrors = null,
		setupAttempted = false
	}: Props = $props();

	const seededPassword = setupPasswordSeed ?? '';

	let password = $state(seededPassword);
	let confirmPassword = $state(seededPassword);
	let fieldErrors = $state<FieldErrors>(setupFieldErrors ? { ...setupFieldErrors } : {});
	let attempted = $state(setupAttempted);
	let submitting = $state(false);
	let formError = $state('');

	const canSubmit = $derived(
		password.length >= 8 &&
			confirmPassword.length >= 8 &&
			password === confirmPassword &&
			!submitting
	);

	const showStrength = $derived(password.length > 0 && !fieldErrors.password);
	const showMatch = $derived(
		confirmPassword.length > 0 &&
			password === confirmPassword &&
			!fieldErrors.confirm_password
	);
	const showMismatch = $derived(Boolean(fieldErrors.confirm_password));

	$effect(() => {
		formError = error;
	});

	function validate(): boolean {
		const next: FieldErrors = {};

		if (!password || password.length < 8) {
			next.password = 'Password must be at least 8 characters';
		}

		if (!confirmPassword || password !== confirmPassword) {
			next.confirm_password = "Passwords don't match";
		}

		fieldErrors = next;
		return Object.keys(next).length === 0;
	}

	function handleFieldInput(field: 'password' | 'confirm_password') {
		if (attempted) {
			validate();
			return;
		}

		if (fieldErrors[field]) {
			const { [field]: _, ...rest } = fieldErrors;
			fieldErrors = rest;
		}
	}

	const handleEnhance: SubmitFunction = ({ cancel }) => {
		attempted = true;
		formError = '';

		if (!validate()) {
			cancel();
			return;
		}

		submitting = true;

		return async ({ result, update }) => {
			submitting = false;

			if (result.type === 'failure') {
				const data = result.data as { error?: string } | undefined;
				formError = data?.error ?? 'Activation failed. Please try again.';
			}

			await update();
		};
	};

	function handlePreviewSubmit(event: SubmitEvent) {
		event.preventDefault();
		attempted = true;
		validate();
	}
</script>

<DriverActivateTopNav title="Create Password" {backHref} />

<DriverActivateProgress current={2} total={2} />

<div class="mx-auto flex w-full max-w-[390px] flex-1 flex-col px-5">
	<h2 class="font-syne text-[22px] font-bold text-gray-900 dark:text-slate-100">
		Create your password
	</h2>
	<p class="font-inter mt-1.5 text-sm leading-[22px] text-gray-500 dark:text-slate-400">
		You're almost in. Set a password to access your jobs.
	</p>

	<form
		id="driver-activate-form"
		class="mt-8 flex flex-col gap-4"
		method="POST"
		onsubmit={preview ? handlePreviewSubmit : undefined}
		use:enhance={preview ? undefined : handleEnhance}
	>
		<input type="hidden" name="token" value={token} />

		<DriverPasswordField
			name="password"
			label="Password"
			placeholder="At least 8 characters"
			autocomplete="new-password"
			bind:value={password}
			error={fieldErrors.password}
			showInfo
			required
			oninput={() => handleFieldInput('password')}
		/>

		{#if showStrength}
			<DriverPasswordStrength {password} />
		{/if}

		<div class="flex flex-col gap-2">
			<DriverPasswordField
				name="confirm_password"
				label="Confirm password"
				placeholder="Repeat your password"
				autocomplete="new-password"
				bind:value={confirmPassword}
				error={fieldErrors.confirm_password}
				required
				oninput={() => handleFieldInput('confirm_password')}
			/>
			{#if showMismatch}
				<DriverPasswordMismatch message={fieldErrors.confirm_password} />
			{:else if showMatch}
				<DriverPasswordMatch {password} {confirmPassword} />
			{/if}
		</div>

		{#if formError}
			<p class="font-inter text-sm text-red-600 dark:text-red-400">{formError}</p>
		{/if}
	</form>
</div>

<div
	class="sticky bottom-0 border-t border-gray-200 bg-white px-5 pt-4 pb-[34px] dark:border-slate-700 dark:bg-slate-900"
>
	<button
		type="submit"
		form="driver-activate-form"
		class="font-syne mx-auto flex h-[52px] w-full max-w-[350px] items-center justify-center gap-2 rounded-[10px] text-[15px] font-bold transition-colors disabled:cursor-not-allowed {canSubmit
			? 'bg-brand text-white hover:bg-[#178566]'
			: 'bg-gray-200 text-gray-400 dark:bg-slate-600 dark:text-slate-400'}"
		disabled={!canSubmit || submitting}
	>
		<Lock size={18} stroke-width={1.75} aria-hidden="true" />
		{submitting ? 'Activating…' : 'Set password & activate'}
	</button>
</div>
