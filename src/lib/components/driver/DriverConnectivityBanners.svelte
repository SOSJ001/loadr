<script lang="ts">
	import { page } from '$app/state';
	import DriverSyncBanner from '$lib/components/driver/DriverSyncBanner.svelte';
	import DriverSyncDoneBanner from '$lib/components/driver/DriverSyncDoneBanner.svelte';
	import OfflineBanner from '$lib/components/driver/OfflineBanner.svelte';
	import { offlineState, setSyncSuccess } from '$lib/stores/offline.svelte';
	import {
		isDriverJobsAllSyncedPreview,
		isDriverJobsBackOnlineSyncPreview,
		isDriverJobsBannerDismissPreview,
		isDriverJobsOfflinePreview
	} from '$lib/utils/driver-jobs-theme';

	type Props = {
		forceOffline?: boolean;
		dismissPreview?: boolean;
		backOnlineSyncPreview?: boolean;
	};

	let {
		forceOffline = false,
		dismissPreview = false,
		backOnlineSyncPreview = false
	}: Props = $props();

	let offlineBannerVisible = $state(false);

	const preview = $derived(page.url.searchParams.get('preview'));
	const showOfflinePreview = $derived(forceOffline || isDriverJobsOfflinePreview(preview));
	const showDismissPreview = $derived(dismissPreview || isDriverJobsBannerDismissPreview(preview));
	const showBackOnlinePreview = $derived(
		backOnlineSyncPreview || isDriverJobsBackOnlineSyncPreview(preview)
	);
	const showAllSyncedPreview = $derived(isDriverJobsAllSyncedPreview(preview));

	const hasPendingSync = $derived(
		offlineState.pendingSyncCount > 0 || offlineState.pendingSyncJobs.length > 0
	);

	const showSyncDoneBanner = $derived(showAllSyncedPreview || offlineState.syncSuccess);

	const showSyncBanner = $derived.by(() => {
		if (showSyncDoneBanner) return false;
		if (showBackOnlinePreview) return true;
		if (!offlineState.online || offlineState.syncError || showOfflinePreview) return false;
		if (!hasPendingSync && !offlineState.syncing) return false;
		return !offlineBannerVisible;
	});
</script>

<OfflineBanner
	forceVisible={showOfflinePreview}
	dismissPreview={showDismissPreview}
	onVisibilityChange={(visible) => {
		offlineBannerVisible = visible;
	}}
/>

<DriverSyncBanner visible={showSyncBanner} />

<DriverSyncDoneBanner
	visible={showSyncDoneBanner}
	autoDismissMs={showAllSyncedPreview ? 0 : 3000}
	onDismiss={() => setSyncSuccess(false)}
/>
