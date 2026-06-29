type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const INSTALL_PROMPT_READY_EVENT = 'loadr-installprompt-ready';
const SW_READY_EVENT = 'loadr-sw-ready';

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let ensurePromise: Promise<boolean> | null = null;

export const pwaInstallState = $state({
	promptAvailable: false,
	waitingForPrompt: false,
	installPromptChecked: false,
	manualInstallHint: false,
	/** User accepted the browser install dialog. */
	installAccepted: false,
	/** Browser reported the app was installed (appinstalled / related-apps check). */
	installConfirmed: false,
	/** Waiting for the OS to finish adding the app after accept. */
	installPending: false
});

function setPromptAvailable(available: boolean) {
	pwaInstallState.promptAvailable = available;
}

function captureInstallPrompt(event: Event) {
	event.preventDefault();
	deferredInstallPrompt = event as BeforeInstallPromptEvent;

	if (typeof window !== 'undefined') {
		(
			window as Window & { __loadrDeferredInstallPrompt?: BeforeInstallPromptEvent | null }
		).__loadrDeferredInstallPrompt = deferredInstallPrompt;
	}

	setPromptAvailable(true);
	pwaInstallState.manualInstallHint = false;
	pwaInstallState.waitingForPrompt = false;
}

export function refreshInstallPromptState(): boolean {
	if (typeof window === 'undefined') return false;

	const stored = (
		window as Window & { __loadrDeferredInstallPrompt?: BeforeInstallPromptEvent | null }
	).__loadrDeferredInstallPrompt;

	if (stored) {
		deferredInstallPrompt = stored;
		setPromptAvailable(true);
		pwaInstallState.waitingForPrompt = false;
		return true;
	}

	const available = deferredInstallPrompt !== null;
	setPromptAvailable(available);
	return available;
}

export function initPwaInstallPrompt(): () => void {
	if (typeof window === 'undefined') return () => {};

	refreshInstallPromptState();

	const markInstalled = () => {
		pwaInstallState.installConfirmed = true;
		pwaInstallState.installAccepted = true;
		pwaInstallState.installPending = false;
		setPromptAvailable(false);
	};

	const onReady = () => refreshInstallPromptState();
	const onAppInstalled = () => markInstalled();

	window.addEventListener(INSTALL_PROMPT_READY_EVENT, onReady);
	window.addEventListener(SW_READY_EVENT, onReady);
	window.addEventListener('beforeinstallprompt', captureInstallPrompt);
	window.addEventListener('appinstalled', onAppInstalled);

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.addEventListener('controllerchange', onReady);
	}

	return () => {
		window.removeEventListener(INSTALL_PROMPT_READY_EVENT, onReady);
		window.removeEventListener(SW_READY_EVENT, onReady);
		window.removeEventListener('beforeinstallprompt', captureInstallPrompt);
		window.removeEventListener('appinstalled', onAppInstalled);
		navigator.serviceWorker?.removeEventListener('controllerchange', onReady);
	};
}

export function isStandalonePwa(): boolean {
	if (typeof window === 'undefined') return false;

	return (
		window.matchMedia('(display-mode: standalone)').matches ||
		(navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}

export function isIosBrowser(): boolean {
	if (typeof navigator === 'undefined') return false;
	return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function buildActivateUrl(origin: string, token: string): string {
	const params = new URLSearchParams({ token });
	return `${origin}/activate?${params.toString()}`;
}

type InstalledRelatedApp = { platform?: string; url?: string };

async function hasInstalledRelatedApp(): Promise<boolean> {
	if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

	const getInstalled = (
		navigator as Navigator & {
			getInstalledRelatedApps?: () => Promise<InstalledRelatedApp[]>;
		}
	).getInstalledRelatedApps;

	if (!getInstalled) return false;

	try {
		const apps = await getInstalled();
		const origin = window.location.origin;
		return apps.some((app) => {
			if (!app.url) return false;
			return app.url.startsWith(origin) || app.url.includes('/manifest.webmanifest');
		});
	} catch {
		return false;
	}
}

/** One-shot check for an already-installed PWA (no waiting UI). */
export async function refreshPwaInstalledState(): Promise<boolean> {
	if (typeof window === 'undefined') return false;

	if (isStandalonePwa() || (await hasInstalledRelatedApp())) {
		pwaInstallState.installConfirmed = true;
		pwaInstallState.installAccepted = true;
		return true;
	}

	return false;
}

/** Wait until the browser/OS reports the PWA was installed. */
export function waitForPwaInstalled(timeoutMs = 20_000): Promise<boolean> {
	if (typeof window === 'undefined') return Promise.resolve(false);
	if (pwaInstallState.installConfirmed || isStandalonePwa()) {
		pwaInstallState.installConfirmed = true;
		return Promise.resolve(true);
	}

	pwaInstallState.installPending = true;

	return new Promise((resolve) => {
		let settled = false;

		const finish = (success: boolean) => {
			if (settled) return;
			settled = true;
			window.clearTimeout(timeout);
			window.clearInterval(poll);
			window.removeEventListener('appinstalled', onAppInstalled);
			pwaInstallState.installPending = false;
			if (success) {
				pwaInstallState.installConfirmed = true;
			}
			resolve(success);
		};

		const onAppInstalled = () => finish(true);

		const poll = window.setInterval(() => {
			void hasInstalledRelatedApp().then((installed) => {
				if (installed) finish(true);
			});
		}, 1_500);

		const timeout = window.setTimeout(() => {
			void hasInstalledRelatedApp().then((installed) => finish(installed));
		}, timeoutMs);

		window.addEventListener('appinstalled', onAppInstalled);
	});
}

export function canContinueAfterInstall(): boolean {
	if (isStandalonePwa()) {
		pwaInstallState.installConfirmed = true;
		return true;
	}
	return pwaInstallState.installConfirmed;
}

/** Wait for SW + deferred install prompt. Call on page load, not on button click. */
export function ensureInstallPrompt(timeoutMs = 12_000): Promise<boolean> {
	if (typeof window === 'undefined') return Promise.resolve(false);
	if (refreshInstallPromptState()) {
		pwaInstallState.installPromptChecked = true;
		return Promise.resolve(true);
	}
	if (ensurePromise) return ensurePromise;

	pwaInstallState.waitingForPrompt = true;

	ensurePromise = (async () => {
		if ('serviceWorker' in navigator) {
			try {
				await Promise.race([
					navigator.serviceWorker.ready,
					new Promise<void>((resolve) => window.setTimeout(resolve, 5_000))
				]);
			} catch {
				// Continue — prompt may still arrive.
			}
		}

		if (refreshInstallPromptState()) return true;

		const ready = await new Promise<boolean>((resolve) => {
			let settled = false;

			const finish = (success: boolean) => {
				if (settled) return;
				settled = true;
				window.clearTimeout(timeout);
				window.removeEventListener(INSTALL_PROMPT_READY_EVENT, onReady);
				window.removeEventListener(SW_READY_EVENT, onReady);
				window.removeEventListener('beforeinstallprompt', onCapture);
				resolve(success);
			};

			const timeout = window.setTimeout(
				() => finish(refreshInstallPromptState()),
				timeoutMs
			);

			const onReady = () => {
				if (refreshInstallPromptState()) finish(true);
			};

			const onCapture = (event: Event) => {
				captureInstallPrompt(event);
				finish(true);
			};

			window.addEventListener(INSTALL_PROMPT_READY_EVENT, onReady);
			window.addEventListener(SW_READY_EVENT, onReady);
			window.addEventListener('beforeinstallprompt', onCapture);
		});

		pwaInstallState.waitingForPrompt = false;
		return ready;
	})().finally(() => {
		ensurePromise = null;
		pwaInstallState.waitingForPrompt = false;
		pwaInstallState.installPromptChecked = true;
	});

	return ensurePromise;
}

export async function promptPwaInstall(): Promise<{ accepted: boolean; confirmed: boolean }> {
	refreshInstallPromptState();
	if (!deferredInstallPrompt) return { accepted: false, confirmed: false };

	await deferredInstallPrompt.prompt();
	const { outcome } = await deferredInstallPrompt.userChoice;
	deferredInstallPrompt = null;

	if (typeof window !== 'undefined') {
		(
			window as Window & { __loadrDeferredInstallPrompt?: BeforeInstallPromptEvent | null }
		).__loadrDeferredInstallPrompt = null;
	}

	setPromptAvailable(false);

	const accepted = outcome === 'accepted';
	if (!accepted) {
		return { accepted: false, confirmed: false };
	}

	pwaInstallState.installAccepted = true;
	const confirmed = await waitForPwaInstalled();
	return { accepted: true, confirmed };
}

export function canPromptPwaInstall(): boolean {
	return refreshInstallPromptState();
}

export function showManualInstallHint(): void {
	pwaInstallState.manualInstallHint = true;
}

export function clearManualInstallHint(): void {
	pwaInstallState.manualInstallHint = false;
}
