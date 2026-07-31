import { goto } from '$app/navigation';
import { isDriverConnectivityOffline } from '$lib/offline/connectivity';

/**
 * Offline client navigations to /jobs refetch server layout data and fail before IndexedDB loads.
 * Prefer history.back() when offline so the previous in-memory jobs list is restored.
 */
export function handleDriverBackClick(event: MouseEvent, backHref: string): void {
	if (!isDriverConnectivityOffline()) return;

	event.preventDefault();

	if (window.history.length > 1) {
		history.back();
		return;
	}

	void goto(backHref);
}
