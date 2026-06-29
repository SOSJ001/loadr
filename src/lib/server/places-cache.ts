import type { AddressSuggestion } from '$lib/server/places';

const SEARCH_TTL_MS = 10 * 60 * 1000;
const RESOLVE_TTL_MS = 60 * 60 * 1000;

type CacheEntry<T> = {
	expiresAt: number;
	value: T;
};

const searchCache = new Map<string, CacheEntry<AddressSuggestion[]>>();
const resolveCache = new Map<string, CacheEntry<AddressSuggestion>>();

function getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
	const entry = cache.get(key);
	if (!entry) return null;
	if (Date.now() > entry.expiresAt) {
		cache.delete(key);
		return null;
	}
	return entry.value;
}

function setCached<T>(
	cache: Map<string, CacheEntry<T>>,
	key: string,
	value: T,
	ttlMs: number
): void {
	cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function getCachedSearch(query: string): AddressSuggestion[] | null {
	return getCached(searchCache, query.trim().toLowerCase());
}

export function setCachedSearch(query: string, suggestions: AddressSuggestion[]): void {
	setCached(searchCache, query.trim().toLowerCase(), suggestions, SEARCH_TTL_MS);
}

export function getCachedResolve(placeId: string): AddressSuggestion | null {
	return getCached(resolveCache, normalizePlaceId(placeId));
}

export function setCachedResolve(suggestion: AddressSuggestion): void {
	setCached(resolveCache, normalizePlaceId(suggestion.placeId), suggestion, RESOLVE_TTL_MS);
}

function normalizePlaceId(placeId: string): string {
	return placeId.startsWith('places/') ? placeId.slice('places/'.length) : placeId;
}
