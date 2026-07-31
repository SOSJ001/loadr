<script lang="ts">
	import { page } from '$app/state';
	import DriverOfflineErrorView from '$lib/components/driver/DriverOfflineErrorView.svelte';
	import ErrorPage from '$lib/components/ui/ErrorPage.svelte';
	import {
		errorPageHomeHref,
		isDriverConnectivityOffline,
		isOfflineNavigationError,
		isNetworkFailure,
		offlineNavigationMessage,
		OFFLINE_PAGE_UNAVAILABLE_MESSAGE
	} from '$lib/utils/error-page';

	let { error, status }: { error: App.Error; status: number } = $props();

	const isJobsRoute = $derived(page.url.pathname.startsWith('/jobs'));

	const showOfflineUi = $derived(
		isJobsRoute &&
			(isDriverConnectivityOffline() ||
				isOfflineNavigationError(error, status) ||
				isNetworkFailure(error))
	);

	const message = $derived(
		showOfflineUi
			? (offlineNavigationMessage(error, status) ?? OFFLINE_PAGE_UNAVAILABLE_MESSAGE)
			: (error?.message ?? 'Something went wrong')
	);

	const homeHref = $derived(errorPageHomeHref(page.url.pathname));
</script>

{#if showOfflineUi}
	<DriverOfflineErrorView {message} />
{:else}
	<ErrorPage {status} {message} {homeHref} />
{/if}
