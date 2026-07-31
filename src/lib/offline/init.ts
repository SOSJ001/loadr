import { flushOfflineQueue } from '$lib/offline/sync';
import { refreshPendingCount } from '$lib/offline/queue';
import { isBrowserOffline, isDriverConnectivityOffline } from '$lib/offline/connectivity';
import { setOnlineStatus } from '$lib/stores/offline.svelte';

let initialized = false;

export function initOfflineSync(): () => void {
	if (initialized || typeof window === 'undefined') return () => {};
	initialized = true;

	const onConnectivityChange = () => {
		setOnlineStatus(navigator.onLine);
		if (navigator.onLine) {
			void flushOfflineQueue();
		}
	};

	setOnlineStatus(navigator.onLine);
	void refreshPendingCount();
	if (navigator.onLine) {
		void flushOfflineQueue();
	}

	window.addEventListener('online', onConnectivityChange);
	window.addEventListener('offline', onConnectivityChange);

	return () => {
		window.removeEventListener('online', onConnectivityChange);
		window.removeEventListener('offline', onConnectivityChange);
	};
}

export function isOffline(): boolean {
	return isDriverConnectivityOffline();
}

export { isBrowserOffline, isDriverConnectivityOffline };
