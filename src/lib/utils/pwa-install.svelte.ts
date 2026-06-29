type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const INSTALL_PROMPT_READY_EVENT = 'loadr-installprompt-ready';

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

export const pwaInstallState = $state({
	promptAvailable: false,
	manualInstallHint: false
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

function syncInstallPromptFromWindow(): void {
	if (typeof window === 'undefined') return;

	const stored = (
		window as Window & { __loadrDeferredInstallPrompt?: BeforeInstallPromptEvent | null }
	).__loadrDeferredInstallPrompt;

	if (stored) {
		deferredInstallPrompt = stored;
		setPromptAvailable(true);
	}
}

export function initPwaInstallPrompt(): () => void {
	if (typeof window === 'undefined') return () => {};

	syncInstallPromptFromWindow();

	const onReady = () => syncInstallPromptFromWindow();
	window.addEventListener(INSTALL_PROMPT_READY_EVENT, onReady);
	window.addEventListener('beforeinstallprompt', captureInstallPrompt);

	return () => {
		window.removeEventListener(INSTALL_PROMPT_READY_EVENT, onReady);
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

/** Chromium browsers that support install (native prompt or browser menu). */
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

export async function promptPwaInstall(): Promise<boolean> {
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
	return deferredInstallPrompt !== null;
}

export function showManualInstallHint(): void {
	pwaInstallState.manualInstallHint = true;
}

export function clearManualInstallHint(): void {
	pwaInstallState.manualInstallHint = false;
}
