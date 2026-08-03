<script lang="ts">
	import DriverOfflineErrorView from '$lib/components/driver/DriverOfflineErrorView.svelte';
	import ErrorPage from '$lib/components/ui/ErrorPage.svelte';
	import {
		isDriverConnectivityOffline,
		isOfflineNavigationError,
		isNetworkFailure,
		offlineNavigationMessage,
		OFFLINE_PAGE_UNAVAILABLE_MESSAGE
	} from '$lib/utils/error-page';

	let { error, status }: { error: App.Error; status: number } = $props();

	const showOfflineUi = $derived(
		isDriverConnectivityOffline() ||
			(error != null && isOfflineNavigationError(error, status)) ||
			isNetworkFailure(error)
	);

	const message = $derived(
		showOfflineUi
			? (offlineNavigationMessage(error, status) ?? OFFLINE_PAGE_UNAVAILABLE_MESSAGE)
			: (error?.message ?? 'Something went wrong')
	);
</script>

{#if showOfflineUi}
	<DriverOfflineErrorView {message} />
{:else}
	<ErrorPage {status} {message} homeHref="/jobs" />
{/if}
