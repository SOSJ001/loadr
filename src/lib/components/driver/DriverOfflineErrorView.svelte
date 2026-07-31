<script lang="ts">
	import { WifiOff } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { getAnyCachedJobsList } from '$lib/offline/page-cache';
	import { isDriverConnectivityOffline } from '$lib/offline/connectivity';
	import { OFFLINE_PAGE_UNAVAILABLE_MESSAGE } from '$lib/utils/error-page';

	type Props = {
		message?: string;
	};

	let { message = OFFLINE_PAGE_UNAVAILABLE_MESSAGE }: Props = $props();

	let root = $state<HTMLElement | null>(null);
	let embeddedInShell = $state(false);
	let canGoBack = $state(false);

	$effect(() => {
		if (!root) return;
		embeddedInShell = Boolean(root.closest('[data-driver-shell]'));
	});

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

<div
	bind:this={root}
	class="mx-auto flex w-full max-w-[390px] flex-col bg-white dark:bg-slate-900 {embeddedInShell
		? 'absolute inset-0'
		: 'h-dvh'}"
>
	<div
		class="flex min-h-0 flex-1 flex-col items-center justify-center px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]"
	>
		<div
			class="flex size-14 shrink-0 items-center justify-center rounded-full bg-amber-600/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
			aria-hidden="true"
		>
			<WifiOff size={28} stroke-width={1.75} />
		</div>

		<h1 class="font-syne mt-5 text-center text-[22px] font-bold leading-tight text-gray-900 dark:text-slate-100">
			You're offline
		</h1>

		<p
			class="font-inter mt-3 w-full max-w-[320px] text-center text-sm leading-relaxed text-balance text-gray-600 dark:text-slate-300"
		>
			{message}
		</p>

		<p
			class="font-inter mt-2 w-full max-w-[320px] text-center text-xs leading-relaxed text-balance text-gray-500 dark:text-slate-400"
		>
			Changes you make will sync when your signal returns.
		</p>

		{#if canGoBack}
			<button
				type="button"
				class="font-syne mt-8 flex h-[52px] w-full max-w-[350px] items-center justify-center rounded-[10px] bg-brand text-[15px] font-bold text-white transition-opacity hover:opacity-90"
				onclick={goBack}
			>
				Back to my jobs
			</button>
		{/if}
	</div>
</div>
