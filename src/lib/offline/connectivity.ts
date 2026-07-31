import { offlineState } from '$lib/stores/offline.svelte';

const OFFLINE_STORAGE_KEY = 'loadr-offline';

export function persistOfflineStatus(online: boolean): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.setItem(OFFLINE_STORAGE_KEY, online ? '0' : '1');
}

export function readPersistedOffline(): boolean {
	if (typeof sessionStorage === 'undefined') return false;
	return sessionStorage.getItem(OFFLINE_STORAGE_KEY) === '1';
}

export function isBrowserOffline(): boolean {
	return typeof navigator !== 'undefined' && !navigator.onLine;
}

/** Best-effort offline signal for driver PWA (navigator can lie; sessionStorage survives reloads). */
export function isDriverConnectivityOffline(): boolean {
	if (isBrowserOffline()) return true;
	if (readPersistedOffline()) return true;
	return !offlineState.online;
}
