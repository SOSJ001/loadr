<script lang="ts">
	import DriverActivateInstallView from '$lib/components/driver/DriverActivateInstallView.svelte';
	import DriverActivateSetupForm from '$lib/components/driver/DriverActivateSetupForm.svelte';
	import DriverActivateSuccess from '$lib/components/driver/DriverActivateSuccess.svelte';
	import DriverPortalLogo from '$lib/components/driver/DriverPortalLogo.svelte';
	import DriverSmsActivationCard from '$lib/components/driver/DriverSmsActivationCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { initTheme, setTheme } from '$lib/stores/theme.svelte';

	let { data, form } = $props();

	const formError = $derived(
		form && 'error' in form && typeof form.error === 'string' ? form.error : ''
	);

	const panelClass =
		'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800';
	const titleClass = 'text-gray-900 dark:text-slate-100';
	const bodyClass = 'text-gray-500 dark:text-slate-400';

	const installBackHref = $derived(
		data.preview ? '/activate?preview=1' : `/activate?token=${encodeURIComponent(data.token)}`
	);

	const setupBackHref = $derived(
		data.preview ? '/activate?preview=2f' : `/activate?token=${encodeURIComponent(data.token)}&step=install`
	);

	const setupHref = $derived(
		data.preview
			? '/activate?preview=2a'
			: `/activate?token=${encodeURIComponent(data.token)}&step=setup`
	);

	const isSuccessStep = $derived(data.step === 'success');
	const isSetupStep = $derived(Boolean(data.invite && data.step === 'setup'));
	const isInstallStep = $derived(Boolean(data.invite && data.step === 'install'));
	const driverName = $derived(data.driverName ?? 'Driver');

	$effect(() => {
		if (data.activateThemeHint === 'light') {
			setTheme('light');
			return;
		}
		if (data.activateThemeHint === 'dark') {
			setTheme('dark');
			return;
		}
		initTheme();
	});
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if isSuccessStep}
	<div class="flex min-h-dvh flex-col bg-white dark:bg-slate-900">
		<DriverActivateSuccess driverName={driverName} preview={data.preview} />
	</div>
{:else if isSetupStep}
	<div class="flex min-h-dvh flex-col bg-white dark:bg-slate-900">
		<DriverActivateSetupForm
			token={data.token}
			backHref={setupBackHref}
			error={formError}
			preview={data.preview}
			setupPasswordSeed={data.setupPasswordSeed}
			setupFieldErrors={data.setupFieldErrors}
			setupAttempted={data.setupAttempted}
		/>
	</div>
{:else if isInstallStep}
	<div class="h-full min-h-0">
		<DriverActivateInstallView
			token={data.token}
			backHref={installBackHref}
			setupHref={setupHref}
			preview={data.preview}
		/>
	</div>
{:else}
	<div class="flex min-h-dvh flex-col bg-white dark:bg-slate-900">
		<header class="flex justify-end px-5 pt-5">
			<ThemeToggle />
		</header>

		<main class="flex flex-1 flex-col items-center px-5 pt-14 pb-10">
			<DriverPortalLogo />

			<div class="mt-8 w-full max-w-[390px]">
				{#if data.error === 'invalid'}
					<div
						class="flex flex-col items-center rounded-2xl border px-6 py-8 text-center {panelClass}"
					>
						<h1 class="font-syne text-[22px] font-bold {titleClass}">Invalid activation link</h1>
						<p class="font-inter mt-3 text-sm {bodyClass}">
							This invite link is missing or no longer valid. Ask your operator to resend the
							invite.
						</p>
						<Button href="/login/driver" variant="secondary" class="mt-6">
							Go to login
						</Button>
					</div>
				{:else if data.error === 'expired' && data.invite}
					<div
						class="flex flex-col items-center rounded-2xl border px-6 py-8 text-center {panelClass}"
					>
						<h1 class="font-syne text-[22px] font-bold {titleClass}">Invite expired</h1>
						<p class="font-inter mt-3 text-sm {bodyClass}">
							This activation link for {data.invite.companyName} has expired. Ask your operator
							to resend the invite.
						</p>
					</div>
				{:else if data.error === 'active'}
					<div
						class="flex flex-col items-center rounded-2xl border px-6 py-8 text-center {panelClass}"
					>
						<h1 class="font-syne text-[22px] font-bold {titleClass}">Already activated</h1>
						<p class="font-inter mt-3 text-sm {bodyClass}">
							This driver account is already active. Log in to continue.
						</p>
						<Button href="/login/driver" variant="brand" class="mt-6 h-[52px] rounded-[10px] px-6">
							Log in
						</Button>
					</div>
				{:else if data.invite}
					<DriverSmsActivationCard
						companyName={data.invite.companyName}
						expiresAt={data.invite.inviteExpiresAt}
						token={data.token}
						preview={data.preview}
					/>
				{/if}
			</div>
		</main>
	</div>
{/if}
