<script lang="ts">
	import { onMount } from 'svelte';
	import { WifiOff } from '@lucide/svelte';
	import { offlineState } from '$lib/stores/offline.svelte';

	type Props = {
		/** Keep visible for Figma preview (`10a` / `offline`). */
		forceVisible?: boolean;
		/** Play the dismiss animation on mount (`10c`). */
		dismissPreview?: boolean;
		/** Called when the offline banner is shown or hidden. */
		onVisibilityChange?: (visible: boolean) => void;
	};

	let { forceVisible = false, dismissPreview = false, onVisibilityChange }: Props = $props();

	const DISMISS_MS = 320;

	let rendered = $state(false);
	let dismissing = $state(false);
	let hadOfflineBanner = $state(false);
	let reducedMotion = $state(false);

	const showSyncError = $derived(
		!rendered && !forceVisible && offlineState.online && Boolean(offlineState.syncError)
	);

	function finishDismiss() {
		rendered = false;
		dismissing = false;
		onVisibilityChange?.(false);
	}

	function startDismiss() {
		if (reducedMotion) {
			finishDismiss();
			return;
		}

		dismissing = true;
		window.setTimeout(finishDismiss, DISMISS_MS);
	}

	function playDismissPreview() {
		rendered = true;
		dismissing = false;
		requestAnimationFrame(() => startDismiss());
	}

	$effect(() => {
		onVisibilityChange?.(rendered && !dismissing);
	});

	$effect(() => {
		if (dismissPreview) return;

		if (forceVisible) {
			rendered = true;
			dismissing = false;
			return;
		}

		if (!offlineState.online) {
			rendered = true;
			dismissing = false;
			hadOfflineBanner = true;
			return;
		}

		if (hadOfflineBanner && rendered && !dismissing) {
			hadOfflineBanner = false;
			startDismiss();
		}
	});

	onMount(() => {
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (dismissPreview) {
			if (reducedMotion) return;
			playDismissPreview();
		} else if (!offlineState.online || forceVisible) {
			rendered = true;
		}
	});
</script>

{#if rendered}
	<div
		class="grid shrink-0 overflow-hidden transition-[grid-template-rows] duration-300 ease-out {dismissing
			? 'grid-rows-[0fr]'
			: 'grid-rows-[1fr]'}"
	>
		<div class="relative min-h-0 overflow-hidden">
			{#if dismissing && !reducedMotion}
				<div
					class="pointer-events-none absolute inset-x-0 top-0 flex h-12 -translate-y-6 items-center justify-between border-l-[3px] border-l-amber-600 bg-[#1f2937] px-4 opacity-15"
					aria-hidden="true"
				>
					<BannerContent />
				</div>
				<div
					class="pointer-events-none absolute inset-x-0 top-0 flex h-12 -translate-y-3 items-center justify-between border-l-[3px] border-l-amber-600 bg-[#1f2937] px-4 opacity-40"
					aria-hidden="true"
				>
					<BannerContent />
				</div>
			{/if}

			<div
				class="flex h-12 items-center justify-between border-l-[3px] border-l-amber-600 bg-[#1f2937] px-4 transition-[transform,opacity] duration-300 ease-out {dismissing
					? '-translate-y-full opacity-0'
					: 'translate-y-0 opacity-100'}"
				role="status"
				aria-live="polite"
			>
				<BannerContent />
			</div>
		</div>
	</div>
{:else if showSyncError}
	<div
		class="flex h-12 shrink-0 items-center justify-between border-l-[3px] border-l-red-500 bg-[#1f2937] px-4"
		role="alert"
	>
		<p class="font-inter min-w-0 truncate text-[13px] text-white">
			<span class="font-bold">Sync failed</span>
			<span class="font-normal opacity-60"> · {offlineState.syncError}</span>
		</p>
	</div>
{/if}

{#snippet BannerContent()}
	<div class="flex min-w-0 flex-1 items-center gap-2">
		<WifiOff size={16} class="shrink-0 text-white" stroke-width={2} aria-hidden="true" />
		<p class="font-inter min-w-0 truncate text-[13px] text-white">
			<span class="font-bold">You're offline</span>
			<span class="font-normal opacity-60"> · changes will sync when signal returns</span>
		</p>
	</div>
	<span class="size-2 shrink-0 rounded bg-amber-600" aria-hidden="true"></span>
{/snippet}
