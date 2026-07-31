import type { HandleClientError } from '@sveltejs/kit';
import { beforeNavigate } from '$app/navigation';
import {
	gotoDriverJobsPath,
	installDriverOfflineNavigation,
	isDriverJobsPath,
	isOfflineContext,
	shouldReuseDriverJobsLoads
} from '$lib/offline/driver-nav';
import { initOfflineSync } from '$lib/offline/init';
import { offlineState } from '$lib/stores/offline.svelte';
import { initPwaInstallPrompt } from '$lib/utils/pwa-install.svelte';
import { registerDriverPwa } from '$lib/pwa/register';
import {
	friendlyErrorMessage,
	isBrowserOffline,
	offlineNavigationMessage,
	OFFLINE_PAGE_UNAVAILABLE_MESSAGE
} from '$lib/utils/error-page';

initPwaInstallPrompt();
registerDriverPwa();
initOfflineSync();
installDriverOfflineNavigation();

beforeNavigate((navigation) => {
	if (!navigation.to || navigation.willUnload || !isOfflineContext()) return;

	const toPath = navigation.to.url.pathname;
	const fromPath = navigation.from?.url.pathname;

	if (!shouldReuseDriverJobsLoads(fromPath, toPath)) return;

	navigation.cancel();
	void gotoDriverJobsPath(
		`${toPath}${navigation.to.url.search}${navigation.to.url.hash}`,
		{ replaceState: navigation.type === 'popstate' }
	);
});

export const handleError: HandleClientError = ({ error, status, message }) => {
	if (!offlineState.online || isBrowserOffline()) {
		return { message: OFFLINE_PAGE_UNAVAILABLE_MESSAGE };
	}

	const offlineMessage = offlineNavigationMessage(error, status);
	if (offlineMessage) {
		return { message: offlineMessage };
	}

	if (status >= 500 && typeof window !== 'undefined' && isDriverJobsPath(window.location.pathname)) {
		return { message: OFFLINE_PAGE_UNAVAILABLE_MESSAGE };
	}

	return {
		message: friendlyErrorMessage(error, status, message)
	};
};
