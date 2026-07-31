<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ErrorPage from '$lib/components/ui/ErrorPage.svelte';
	import { getAnyCachedJobsList } from '$lib/offline/page-cache';
	import { offlineState } from '$lib/stores/offline.svelte';
	import {
		isBrowserOffline,
		isOfflineNavigationError,
		offlineNavigationMessage,
		OFFLINE_PAGE_UNAVAILABLE_MESSAGE
	} from '$lib/utils/error-page';

	let { error, status }: { error: App.Error; status: number } = $props();

	let browserOffline = $state(isBrowserOffline());

	const isOfflineError = $derived(
		!offlineState.online ||
			browserOffline ||
			isOfflineNavigationError(error, status)
	);

	const offlineMessage = $derived(
		isOfflineError
			? (offlineNavigationMessage(error, status) ?? OFFLINE_PAGE_UNAVAILABLE_MESSAGE)
			: null
	);

	let canGoBack = $state(false);

	onMount(() => {
		browserOffline = isBrowserOffline();

		void getAnyCachedJobsList().then((list) => {
			canGoBack = list != null;
		});
	});

	function goBack() {
		void goto('/jobs', { invalidateAll: false });
	}
</script>

{#if isOfflineError}
	<div class="flex min-h-full flex-1 flex-col items-center justify-center bg-white px-6 dark:bg-slate-900">
		<p class="font-syne text-xl font-bold text-gray-900 dark:text-slate-100">You're offline</p>
		<p class="font-inter mt-3 max-w-sm text-center text-sm leading-relaxed text-gray-600 dark:text-slate-300">
			{offlineMessage}
		</p>
		<p class="font-inter mt-2 max-w-sm text-center text-xs text-gray-500 dark:text-slate-400">
			Changes you make will sync when your signal returns.
		</p>
		{#if canGoBack}
			<button
				type="button"
				class="font-syne mt-6 rounded-[10px] bg-brand px-5 py-3 text-sm font-bold text-white"
				onclick={goBack}
			>
				Back to my jobs
			</button>
		{/if}
	</div>
{:else}
	<ErrorPage {status} message={error?.message ?? 'Something went wrong'} homeHref="/jobs" />
{/if}
