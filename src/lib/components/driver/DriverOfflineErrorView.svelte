<script lang="ts">
	import { goto } from '$app/navigation';
	import { getAnyCachedJobsList } from '$lib/offline/page-cache';
	import { isDriverConnectivityOffline } from '$lib/offline/connectivity';
	import { OFFLINE_PAGE_UNAVAILABLE_MESSAGE } from '$lib/utils/error-page';

	type Props = {
		message?: string;
	};

	let { message = OFFLINE_PAGE_UNAVAILABLE_MESSAGE }: Props = $props();

	let canGoBack = $state(false);

	$effect(() => {
		void getAnyCachedJobsList().then((list) => {
			canGoBack = list != null;
		});
	});

	function goBack() {
		if (isDriverConnectivityOffline() && window.history.length > 1) {
			history.back();
			return;
		}

		void goto('/jobs');
	}
</script>

<div class="flex min-h-full flex-1 flex-col items-center justify-center bg-white px-6 dark:bg-slate-900">
	<p class="font-syne text-xl font-bold text-gray-900 dark:text-slate-100">You're offline</p>
	<p class="font-inter mt-3 max-w-sm text-center text-sm leading-relaxed text-gray-600 dark:text-slate-300">
		{message}
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
