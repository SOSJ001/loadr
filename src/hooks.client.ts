import type { HandleClientError } from '@sveltejs/kit';
import { initOfflineSync } from '$lib/offline/init';
import { initPwaInstallPrompt } from '$lib/utils/pwa-install.svelte';
import { registerDriverPwa } from '$lib/pwa/register';
import { setOnlineStatus } from '$lib/stores/offline.svelte';
import {
	friendlyErrorMessage,
	isNetworkFailure,
	isOfflineNavigationError,
	offlineNavigationMessage
} from '$lib/utils/error-page';

initPwaInstallPrompt();
registerDriverPwa();
initOfflineSync();

export const handleError: HandleClientError = ({ error, status, message }) => {
	if (isOfflineNavigationError(error, status) || isNetworkFailure(error)) {
		setOnlineStatus(false);
	}

	const offlineMessage = offlineNavigationMessage(error, status);
	if (offlineMessage) {
		return { message: offlineMessage };
	}

	return {
		message: friendlyErrorMessage(error, status, message)
	};
};
