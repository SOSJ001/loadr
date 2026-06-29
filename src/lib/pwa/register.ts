import { registerSW } from 'virtual:pwa-register';

let registered = false;

export function registerDriverPwa(): void {
	if (registered || typeof window === 'undefined') return;
	registered = true;

	registerSW({
		immediate: true,
		onRegisteredSW(_swUrl: string, registration: ServiceWorkerRegistration | undefined) {
			if (registration) {
				registration.update().catch(() => {
					// Best-effort update check.
				});
			}
		}
	});
}
