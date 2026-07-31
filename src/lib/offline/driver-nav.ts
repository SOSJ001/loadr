import { goto } from '$app/navigation';
import { isOffline } from '$lib/offline/init';
import { offlineState } from '$lib/stores/offline.svelte';

export function isDriverJobsPath(pathname: string): boolean {
	return pathname === '/jobs' || pathname.startsWith('/jobs/');
}

export function isOfflineContext(): boolean {
	return isOffline() || !offlineState.online;
}

/** Reuse in-memory SvelteKit load data instead of refetching server loads (required offline). */
export async function gotoDriverJobsPath(
	href: string,
	options: { replaceState?: boolean } = {}
): Promise<void> {
	await goto(href, {
		invalidateAll: false,
		keepFocus: true,
		replaceState: options.replaceState ?? false
	});
}

export function shouldReuseDriverJobsLoads(fromPath: string | undefined, toPath: string): boolean {
	if (!isOfflineContext() || !isDriverJobsPath(toPath)) return false;

	// Back to list from a job screen — most common offline failure.
	if (toPath === '/jobs' && fromPath?.startsWith('/jobs/')) return true;

	// Any in-app jobs navigation while offline should avoid server refetch when possible.
	return Boolean(fromPath && isDriverJobsPath(fromPath));
}

export function installDriverOfflineNavigation(): void {
	if (typeof document === 'undefined') return;

	document.addEventListener(
		'click',
		(event) => {
			if (!isOfflineContext()) return;

			const target = event.target;
			if (!(target instanceof Element)) return;

			const anchor = target.closest('a[href]');
			if (!(anchor instanceof HTMLAnchorElement)) return;
			if (anchor.target && anchor.target !== '_self') return;
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

			const url = new URL(anchor.href, window.location.origin);
			if (url.origin !== window.location.origin) return;
			if (!isDriverJobsPath(url.pathname)) return;

			const fromPath = window.location.pathname;
			if (!shouldReuseDriverJobsLoads(fromPath, url.pathname)) return;

			event.preventDefault();
			void gotoDriverJobsPath(`${url.pathname}${url.search}${url.hash}`);
		},
		true
	);
}
