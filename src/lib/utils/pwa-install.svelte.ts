type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const INSTALL_PROMPT_READY_EVENT = 'loadr-installprompt-ready';
const SW_READY_EVENT = 'loadr-sw-ready';

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

export const pwaInstallState = $state({
	promptAvailable: false,
	manualInstallHint: false,
	preparing: false
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
}

export function refreshInstallPromptState(): boolean {
	if (typeof window === 'undefined') return false;

	const stored = (
		window as Window & { __loadrDeferredInstallPrompt?: BeforeInstallPromptEvent | null }
	).__loadrDeferredInstallPrompt;

	if (stored) {
		deferredInstallPrompt = stored;
		setPromptAvailable(true);
		return true;
	}

	return deferredInstallPrompt !== null;
}

export function initPwaInstallPrompt(): () => void {
	if (typeof window === 'undefined') return () => {};

	refreshInstallPromptState();

	const onReady = () => refreshInstallPromptState();
	window.addEventListener(INSTALL_PROMPT_READY_EVENT, onReady);
	window.addEventListener(SW_READY_EVENT, onReady);
	window.addEventListener('beforeinstallprompt', captureInstallPrompt);

	return () => {
		window.removeEventListener(INSTALL_PROMPT_READY_EVENT, onReady);
		window.removeEventListener(SW_READY_EVENT, onReady);
		window.removeEventListener('beforeinstallprompt', captureInstallPrompt);
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

export function canOfferPwaInstall(): boolean {
	if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
	if (isStandalonePwa() || isIosBrowser()) return false;

	return (
		'onbeforeinstallprompt' in window ||
		/(chrome|crios|brave|chromium|edg|opr)\//i.test(navigator.userAgent)
	);
}

export function buildActivateUrl(origin: string, token: string): string {
	const params = new URLSearchParams({ token });
	return `${origin}/activate?${params.toString()}`;
}

/** Wait for SW registration and the browser's deferred install prompt. */
export async function ensureInstallPrompt(timeoutMs = 10_000): Promise<boolean> {
	if (typeof window === 'undefined') return false;

	if (refreshInstallPromptState()) return true;

	if ('serviceWorker' in navigator) {
		try {
			await Promise.race([
				navigator.serviceWorker.ready,
				new Promise<void>((resolve) => window.setTimeout(resolve, 4_000))
			]);
		} catch {
			// Continue — prompt may still arrive.
		}
	}

	if (refreshInstallPromptState()) return true;

	return new Promise((resolve) => {
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

		const timeout = window.setTimeout(() => finish(refreshInstallPromptState()), timeoutMs);

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
}

export async function promptPwaInstall(): Promise<boolean> {
	refreshInstallPromptState();
	if (!deferredInstallPrompt) return false;

	await deferredInstallPrompt.prompt();
	const { outcome } = await deferredInstallPrompt.userChoice;
	deferredInstallPrompt = null;

	if (typeof window !== 'undefined') {
		(
			window as Window & { __loadrDeferredInstallPrompt?: BeforeInstallPromptEvent | null }
		).__loadrDeferredInstallPrompt = null;
	}

	setPromptAvailable(false);
	return outcome === 'accepted';
}

export function canPromptPwaInstall(): boolean {
	refreshInstallPromptState();
	return deferredInstallPrompt !== null;
}

export function showManualInstallHint(): void {
	pwaInstallState.manualInstallHint = true;
}

export function clearManualInstallHint(): void {
	pwaInstallState.manualInstallHint = false;
}

export function beginInstallPreparation(): void {
	pwaInstallState.preparing = true;
}

export function endInstallPreparation(): void {
	pwaInstallState.preparing = false;
}
