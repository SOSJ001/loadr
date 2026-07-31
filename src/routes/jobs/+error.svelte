<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ErrorPage from '$lib/components/ui/ErrorPage.svelte';
	import { isOffline } from '$lib/offline/init';
	import { getAnyCachedJobsList } from '$lib/offline/page-cache';

	let { error, status }: { error: App.Error; status: number } = $props();

	let offlineMessage = $state<string | null>(null);
	let canGoBack = $state(false);

	onMount(async () => {
		if (!isOffline() && status !== 503) return;

		offlineMessage =
			error?.message ??
			'This page is not available offline. Connect to load it, or open it while online first.';

		const list = await getAnyCachedJobsList();
		canGoBack = list != null;
	});

	const message = $derived(
		offlineMessage ?? error?.message ?? 'Something went wrong'
	);

	function goBack() {
		void goto('/jobs');
	}
</script>

{#if offlineMessage}
	<div class="flex min-h-full flex-1 flex-col items-center justify-center bg-white px-6 dark:bg-slate-900">
		<p class="font-inter max-w-sm text-center text-sm text-gray-600 dark:text-slate-300">
			{message}
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
	<ErrorPage {status} {message} homeHref="/jobs" />
{/if}
