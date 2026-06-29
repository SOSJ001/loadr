type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

export const pwaInstallState = $state({
	promptAvailable: false
});

function setPromptAvailable(available: boolean) {
	pwaInstallState.promptAvailable = available;
}

export function initPwaInstallPrompt(): () => void {
	if (typeof window === 'undefined') return () => {};

	const handler = (event: Event) => {
		event.preventDefault();
		deferredInstallPrompt = event as BeforeInstallPromptEvent;
		setPromptAvailable(true);
	};

	window.addEventListener('beforeinstallprompt', handler);

	// Chrome may have fired before this listener was registered.
	setPromptAvailable(deferredInstallPrompt !== null);

	return () => {
		window.removeEventListener('beforeinstallprompt', handler);
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

export async function promptPwaInstall(): Promise<boolean> {
	if (!deferredInstallPrompt) return false;

	await deferredInstallPrompt.prompt();
	const { outcome } = await deferredInstallPrompt.userChoice;
	deferredInstallPrompt = null;
	setPromptAvailable(false);
	return outcome === 'accepted';
}

export function canPromptPwaInstall(): boolean {
	return deferredInstallPrompt !== null;
}
