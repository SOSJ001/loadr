import { registerSW } from 'virtual:pwa-register';

let registered = false;

function announceSwReady(): void {
	window.dispatchEvent(new Event('loadr-sw-ready'));
}

function watchRegistration(registration: ServiceWorkerRegistration): void {
	if (registration.active) {
		announceSwReady();
		return;
	}

	const worker = registration.installing ?? registration.waiting;
	if (!worker) return;

	worker.addEventListener('statechange', () => {
		if (worker.state === 'activated') {
			announceSwReady();
		}
	});
}

export function registerDriverPwa(): void {
	if (registered || typeof window === 'undefined') return;
	registered = true;

	registerSW({
		immediate: true,
		onRegisterError(error) {
			console.error('[Loadr PWA] Service worker registration failed:', error);
		},
		onRegisteredSW(_swUrl: string, registration: ServiceWorkerRegistration | undefined) {
			if (!registration) return;

			watchRegistration(registration);
			registration.update().catch(() => {
				// Best-effort update check.
			});
		}
	});
}
