<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ArrowUpRight, Copy } from '@lucide/svelte';
	import DriverActivateProgress from '$lib/components/driver/DriverActivateProgress.svelte';
	import DriverActivateTopNav from '$lib/components/driver/DriverActivateTopNav.svelte';
	import {
		buildActivateUrl,
		canContinueAfterInstall,
		canPromptPwaInstall,
		clearManualInstallHint,
		ensureInstallPrompt,
		isIosBrowser,
		isStandalonePwa,
		promptPwaInstall,
		pwaInstallState,
		refreshInstallPromptState,
		showManualInstallHint,
		refreshPwaInstalledState
	} from '$lib/utils/pwa-install.svelte';

	type Props = {
		token: string;
		backHref: string;
		setupHref: string;
		preview?: boolean;
	};

	let { token, backHref, setupHref, preview = false }: Props = $props();

	let copied = $state(false);
	let installing = $state(false);

	const activationUrl = $derived(buildActivateUrl(page.url.origin, token));
	const appHost = $derived(page.url.host);
	const installEnabled = $derived(
		!installing &&
			!pwaInstallState.waitingForPrompt &&
			(pwaInstallState.promptAvailable || pwaInstallState.installPromptChecked || preview)
	);
	const installLabel = $derived(
		pwaInstallState.waitingForPrompt
			? 'Preparing…'
			: installing || pwaInstallState.installPending
				? 'Installing…'
				: 'Install'
	);
	const canContinueToSetup = $derived(preview || isIosBrowser() || canContinueAfterInstall());
	const continueHint = $derived(
		pwaInstallState.installPending
			? 'Adding Loadr to your home screen…'
			: pwaInstallState.installAccepted && !pwaInstallState.installConfirmed
				? 'Install did not finish. Check your app drawer, then try Install again.'
				: pwaInstallState.installConfirmed
					? 'Loadr is installed. Open it from your home screen or app drawer when you are ready.'
					: 'Install Loadr before creating your password.'
	);

	function continueToSetup() {
		if (preview) {
			void goto('/activate?preview=2a');
			return;
		}
		void goto(setupHref);
	}

	async function copyActivationLink() {
		try {
			await navigator.clipboard.writeText(activationUrl);
			copied = true;
			window.setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// Clipboard may be unavailable in insecure contexts.
		}
	}

	async function handleInstallClick() {
		if (installing || pwaInstallState.waitingForPrompt) return;

		clearManualInstallHint();

		if (!canPromptPwaInstall()) {
			showManualInstallHint();
			return;
		}

		installing = true;
		try {
			const { accepted, confirmed } = await promptPwaInstall();
			if (accepted && !confirmed) {
				showManualInstallHint();
			}
		} finally {
			installing = false;
		}
	}

	onMount(() => {
		refreshInstallPromptState();
		void ensureInstallPrompt();
		void refreshPwaInstalledState();

		if (!preview && isStandalonePwa()) {
			void goto(setupHref);
		}

		const onVisible = () => {
			if (!preview && isStandalonePwa()) {
				void goto(setupHref);
			}
		};

		document.addEventListener('visibilitychange', onVisible);
		return () => document.removeEventListener('visibilitychange', onVisible);
	});
</script>

<div class="flex h-full min-h-0 flex-col bg-white dark:bg-slate-900">
	<div class="mx-auto w-full max-w-[390px] shrink-0">
		<DriverActivateTopNav title="Get the app" {backHref} />
		<DriverActivateProgress current={1} total={2} />
	</div>

	<div
		class="mx-auto flex min-h-0 w-full max-w-[390px] flex-1 flex-col overflow-y-auto overscroll-y-contain px-5 pb-40 [-webkit-overflow-scrolling:touch]"
	>
		<div
			class="mx-auto flex items-center gap-1.5 rounded-full border border-brand bg-green-100 px-2.5 py-1.5 dark:bg-green-950"
		>
			<span class="size-1.5 rounded-full bg-brand" aria-hidden="true"></span>
			<p class="font-inter text-[11px] font-medium text-green-700 dark:text-[#7dd3b0]">
				Activation link opened
			</p>
		</div>

		<h2 class="font-syne mt-3.5 text-[22px] font-bold text-gray-900 dark:text-slate-100">
			Install Loadr first
		</h2>
		<p class="font-inter mt-1.5 text-sm leading-[1.6] text-gray-500 dark:text-slate-400">
			Add Loadr to your home screen, then create your password.
		</p>

		<div class="mt-4 flex flex-col gap-2.5">
			<section
				class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3.5 dark:border-slate-600 dark:bg-slate-800"
			>
				<p class="font-inter text-sm font-semibold text-gray-900 dark:text-slate-100">
					Use Chrome
				</p>
				<p class="font-inter text-xs leading-[1.55] text-gray-500 dark:text-slate-400">
					Install Chrome if needed, then open this activation link there.
				</p>
				<div class="flex flex-wrap gap-2">
					<div
						class="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 dark:border-slate-600 dark:bg-slate-900"
					>
						<img
							src="/icons/chrome.png"
							srcset="/icons/chrome.png 1x, /icons/chrome@2x.png 2x"
							alt=""
							class="size-5 shrink-0"
							width="20"
							height="20"
						/>
						<span class="font-inter text-xs font-medium text-gray-900 dark:text-slate-100"
							>Chrome</span
						>
					</div>
				</div>
				<p class="font-inter text-xs font-medium text-gray-400 dark:text-slate-500">
					Copy this link
				</p>
				<div
					class="flex h-11 items-center gap-2 rounded-[10px] border border-gray-200 bg-white pl-3 pr-1 dark:border-slate-600 dark:bg-slate-900"
				>
					<p
						class="font-dm-mono min-w-0 flex-1 truncate text-[11px] text-brand"
						title={activationUrl}
					>
						{activationUrl}
					</p>
					<button
						type="button"
						class="flex size-9 shrink-0 items-center justify-center rounded-lg text-brand transition-colors hover:bg-green-950/40"
						aria-label={copied ? 'Link copied' : 'Copy activation link'}
						onclick={copyActivationLink}
					>
						<Copy size={16} stroke-width={1.75} aria-hidden="true" />
					</button>
				</div>
				<p class="font-inter text-[11px] text-gray-400 dark:text-slate-500">
					{copied ? 'Copied!' : 'Tap to copy'}
				</p>
			</section>

			<section
				class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3.5 dark:border-slate-600 dark:bg-slate-800"
			>
				<p class="font-inter text-sm font-semibold text-gray-900 dark:text-slate-100">
					Add to your home screen
				</p>
				<p class="font-inter text-xs leading-[1.55] text-gray-500 dark:text-slate-400">
					{#if pwaInstallState.installPending}
						Finishing install — check your home screen or app drawer in a moment.
					{:else if pwaInstallState.installConfirmed}
						Loadr is on your device. Look for the Loadr icon on your home screen or in your app
						drawer.
					{:else if pwaInstallState.installAccepted}
						If you do not see Loadr on your home screen, open your app drawer or try Install again.
					{:else if pwaInstallState.waitingForPrompt}
						Setting up install — this usually takes a few seconds.
					{:else if pwaInstallState.promptAvailable}
						Tap Install to add Loadr to your home screen.
					{:else if pwaInstallState.installPromptChecked}
						Your browser may not show an in-page install button. Use the menu option below.
					{:else}
						Install will be available once your browser is ready.
					{/if}
				</p>
				<div
					class="flex h-14 items-center gap-2.5 rounded-xl border-[1.5px] border-brand bg-gray-50 px-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:bg-slate-900 dark:shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
				>
					<img
						src="/icons/icon-192.png"
						alt=""
						class="size-9 shrink-0 rounded-[9px] border border-gray-200 bg-white dark:border-slate-600"
						width="36"
						height="36"
					/>
					<div class="min-w-0 flex-1">
						<p class="font-inter truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
							Install Loadr
						</p>
						<p class="font-inter truncate text-[11px] text-gray-500 dark:text-slate-500">
							{appHost}
						</p>
					</div>
					<button
						type="button"
						class="shrink-0 rounded-lg bg-brand px-4 py-2 font-inter text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
						disabled={!installEnabled}
						onclick={handleInstallClick}
					>
						{installLabel}
					</button>
				</div>
				<p class="font-inter text-[11px] text-gray-400 dark:text-slate-500">
					{#if pwaInstallState.manualInstallHint}
						<span class="font-medium text-amber-600 dark:text-amber-500">
							In Chrome, open the menu (⋮) → Install Loadr, or look for the install icon in the
							address bar.
						</span>
					{:else}
						<span class="font-medium">No Install button?</span>
						{#if isIosBrowser()}
							<span class="text-gray-500 dark:text-slate-400"> Share → Add to Home Screen</span>
						{:else}
							<span class="text-gray-500 dark:text-slate-400">
								In Chrome, use the menu (⋮) → Install app
							</span>
						{/if}
					{/if}
				</p>
			</section>
		</div>
	</div>

	<div
		class="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-5 pt-4 pb-[34px] dark:border-slate-700 dark:bg-slate-900"
	>
		<p class="font-inter mx-auto mb-3 max-w-[350px] text-center text-[11px] leading-[1.5] text-gray-500 dark:text-slate-400">
			{continueHint}
		</p>
		<button
			type="button"
			class="font-syne mx-auto flex h-[52px] w-full max-w-[350px] items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
			disabled={!canContinueToSetup}
			onclick={continueToSetup}
		>
			Continue to create password
			<ArrowUpRight size={18} stroke-width={2} aria-hidden="true" />
		</button>
	</div>
</div>

<style>
	.font-dm-mono {
		font-family: 'DM Mono', ui-monospace, monospace;
	}
</style>
