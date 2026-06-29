import { env } from '$env/dynamic/private';
import type { ApiErrorCode } from '$lib/types/api';
import {
	getCachedResolve,
	getCachedSearch,
	setCachedResolve,
	setCachedSearch
} from '$lib/server/places-cache';
import { isPlacesMockEnabled, mockResolveAddress, mockSearchAddress } from '$lib/server/places-mock';

export type AddressSuggestion = {
	address: string;
	placeId: string;
	lat?: number;
	lng?: number;
};

export class PlacesError extends Error {
	constructor(
		message: string,
		public readonly code: ApiErrorCode,
		public readonly status = 400
	) {
		super(message);
		this.name = 'PlacesError';
	}
}

export function isPlacesError(error: unknown): error is PlacesError {
	return error instanceof PlacesError;
}

const MAX_SUGGESTIONS = 5;
const MIN_QUERY_LENGTH = 3;

type PlacesProvider = 'new' | 'legacy';

type AutocompleteResponse = {
	suggestions?: Array<{
		placePrediction?: {
			place?: string;
			placeId?: string;
			text?: { text?: string };
			structuredFormat?: {
				mainText?: { text?: string };
				secondaryText?: { text?: string };
			};
		};
	}>;
};

type PlaceDetailsResponse = {
	formattedAddress?: string;
	location?: { latitude?: number; longitude?: number };
};

type LegacyAutocompleteResponse = {
	status?: string;
	error_message?: string;
	predictions?: Array<{
		description?: string;
		place_id?: string;
	}>;
};

type LegacyDetailsResponse = {
	status?: string;
	error_message?: string;
	result?: {
		formatted_address?: string;
		geometry?: { location?: { lat?: number; lng?: number } };
	};
};

function getApiKey(): string | undefined {
	return env.GOOGLE_MAPS_API_KEY?.trim() || undefined;
}

function getPlacesProvider(): PlacesProvider {
	const configured = env.GOOGLE_PLACES_API?.trim().toLowerCase();
	return configured === 'legacy' ? 'legacy' : 'new';
}

function normalizePlaceId(placeId: string): string {
	return placeId.startsWith('places/') ? placeId.slice('places/'.length) : placeId;
}

function placeDetailsUrl(placeId: string): string {
	return `https://places.googleapis.com/v1/places/${encodeURIComponent(normalizePlaceId(placeId))}`;
}

async function readGoogleError(response: Response): Promise<string> {
	try {
		const body = (await response.json()) as { error?: { message?: string; status?: string } };
		return body.error?.message ?? body.error?.status ?? response.statusText;
	} catch {
		return response.statusText;
	}
}

function mapLegacyStatus(status: string | undefined, errorMessage?: string): never | void {
	switch (status) {
		case 'OK':
		case 'ZERO_RESULTS':
			return;
		case 'OVER_QUERY_LIMIT':
			throw new PlacesError(
				'Google Places quota exceeded. Wait a few minutes or check billing and quotas in Google Cloud Console.',
				'RATE_LIMIT_EXCEEDED',
				429
			);
		case 'REQUEST_DENIED':
			throw new PlacesError(
				errorMessage ??
					'Google Places API access denied. Enable Places API on your Google Cloud project and check your API key restrictions.',
				'SERVER_ERROR',
				502
			);
		case 'INVALID_REQUEST':
			throw new PlacesError(errorMessage ?? 'Invalid address search request', 'VALIDATION_ERROR', 400);
		default:
			throw new PlacesError(errorMessage ?? 'Address search failed', 'SERVER_ERROR', 502);
	}
}

function formatPredictionAddress(
	prediction: NonNullable<AutocompleteResponse['suggestions']>[number]['placePrediction']
): string {
	const fullText = prediction?.text?.text?.trim();
	if (fullText) return fullText;

	const mainText = prediction?.structuredFormat?.mainText?.text?.trim();
	const secondaryText = prediction?.structuredFormat?.secondaryText?.text?.trim();

	if (mainText && secondaryText) return `${mainText}, ${secondaryText}`;
	return mainText ?? secondaryText ?? '';
}

function mapAutocompleteSuggestions(response: AutocompleteResponse): AddressSuggestion[] {
	return (
		response.suggestions
			?.map((item) => {
				const prediction = item.placePrediction;
				const placeId = prediction?.placeId ?? prediction?.place;
				const address = formatPredictionAddress(prediction);

				if (!placeId || !address) return null;

				return { address, placeId };
			})
			.filter((item): item is AddressSuggestion => item !== null)
			.slice(0, MAX_SUGGESTIONS) ?? []
	);
}

async function searchAddressNew(query: string, apiKey: string): Promise<AddressSuggestion[]> {
	const autocompleteResponse = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Goog-Api-Key': apiKey
		},
		body: JSON.stringify({
			input: query,
			includedRegionCodes: ['gb'],
			languageCode: 'en-GB',
			regionCode: 'GB'
		})
	});

	if (!autocompleteResponse.ok) {
		if (autocompleteResponse.status === 429) {
			throw new PlacesError(
				'Google Places quota exceeded. Wait a few minutes or check billing and quotas in Google Cloud Console.',
				'RATE_LIMIT_EXCEEDED',
				429
			);
		}

		const detail = await readGoogleError(autocompleteResponse);
		console.error('[loadr] Places New autocomplete failed:', autocompleteResponse.status, detail);
		throw new PlacesError(detail || 'Address search failed', 'SERVER_ERROR', 502);
	}

	const autocomplete = (await autocompleteResponse.json()) as AutocompleteResponse;
	return mapAutocompleteSuggestions(autocomplete);
}

async function searchAddressLegacy(query: string, apiKey: string): Promise<AddressSuggestion[]> {
	const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
	url.searchParams.set('input', query);
	url.searchParams.set('key', apiKey);
	url.searchParams.set('components', 'country:gb');
	url.searchParams.set('language', 'en-GB');

	const response = await fetch(url);
	if (!response.ok) {
		throw new PlacesError('Address search failed', 'SERVER_ERROR', 502);
	}

	const data = (await response.json()) as LegacyAutocompleteResponse;
	mapLegacyStatus(data.status, data.error_message);

	return (
		data.predictions
			?.map((prediction) => {
				const address = prediction.description?.trim();
				const placeId = prediction.place_id;

				if (!address || !placeId) return null;
				return { address, placeId };
			})
			.filter((item): item is AddressSuggestion => item !== null)
			.slice(0, MAX_SUGGESTIONS) ?? []
	);
}

async function fetchPlaceDetailsNew(
	placeId: string,
	apiKey: string
): Promise<AddressSuggestion | null> {
	const response = await fetch(placeDetailsUrl(placeId), {
		headers: {
			'Content-Type': 'application/json',
			'X-Goog-Api-Key': apiKey,
			'X-Goog-FieldMask': 'formattedAddress,location'
		}
	});

	if (!response.ok) {
		if (response.status === 429) {
			throw new PlacesError(
				'Google Places quota exceeded. Wait a few minutes or check billing and quotas in Google Cloud Console.',
				'RATE_LIMIT_EXCEEDED',
				429
			);
		}

		const detail = await readGoogleError(response);
		console.error('[loadr] Places New details failed:', response.status, detail);
		throw new PlacesError(detail || 'Failed to fetch place details', 'SERVER_ERROR', 502);
	}

	const data = (await response.json()) as PlaceDetailsResponse;
	const lat = data.location?.latitude;
	const lng = data.location?.longitude;

	if (!data.formattedAddress || lat === undefined || lng === undefined) {
		return null;
	}

	return {
		address: data.formattedAddress,
		placeId,
		lat,
		lng
	};
}

async function fetchPlaceDetailsLegacy(
	placeId: string,
	apiKey: string
): Promise<AddressSuggestion | null> {
	const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
	url.searchParams.set('place_id', normalizePlaceId(placeId));
	url.searchParams.set('key', apiKey);
	url.searchParams.set('fields', 'formatted_address,geometry');
	url.searchParams.set('language', 'en-GB');

	const response = await fetch(url);
	if (!response.ok) {
		throw new PlacesError('Failed to fetch place details', 'SERVER_ERROR', 502);
	}

	const data = (await response.json()) as LegacyDetailsResponse;
	mapLegacyStatus(data.status, data.error_message);

	const lat = data.result?.geometry?.location?.lat;
	const lng = data.result?.geometry?.location?.lng;

	if (!data.result?.formatted_address || lat === undefined || lng === undefined) {
		return null;
	}

	return {
		address: data.result.formatted_address,
		placeId,
		lat,
		lng
	};
}

async function searchWithProvider(
	query: string,
	apiKey: string,
	provider: PlacesProvider
): Promise<AddressSuggestion[]> {
	return provider === 'legacy'
		? searchAddressLegacy(query, apiKey)
		: searchAddressNew(query, apiKey);
}

async function resolveWithProvider(
	placeId: string,
	apiKey: string,
	provider: PlacesProvider
): Promise<AddressSuggestion | null> {
	return provider === 'legacy'
		? fetchPlaceDetailsLegacy(placeId, apiKey)
		: fetchPlaceDetailsNew(placeId, apiKey);
}

/** Calls Google Places autocomplete; returns dropdown rows without waiting on place details. */
export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
	const trimmed = query.trim();
	if (trimmed.length < MIN_QUERY_LENGTH) {
		return [];
	}

	const cached = getCachedSearch(trimmed);
	if (cached) {
		return cached;
	}

	if (isPlacesMockEnabled()) {
		const suggestions = mockSearchAddress(trimmed);
		setCachedSearch(trimmed, suggestions);
		return suggestions;
	}

	const apiKey = getApiKey();
	if (!apiKey) {
		throw new PlacesError(
			'Address search is not configured. Add GOOGLE_MAPS_API_KEY to your environment.',
			'SERVER_ERROR',
			503
		);
	}

	const suggestions = await searchWithProvider(trimmed, apiKey, getPlacesProvider());
	setCachedSearch(trimmed, suggestions);
	return suggestions;
}

/** Resolve a selected autocomplete row to a formatted address with coordinates. */
export async function resolveAddressSuggestion(placeId: string): Promise<AddressSuggestion> {
	const cached = getCachedResolve(placeId);
	if (cached?.lat != null && cached.lng != null) {
		return cached;
	}

	if (isPlacesMockEnabled()) {
		const details = mockResolveAddress(placeId);
		if (!details) {
			throw new PlacesError('Could not resolve selected address', 'VALIDATION_ERROR', 422);
		}
		setCachedResolve(details);
		return details;
	}

	const apiKey = getApiKey();
	if (!apiKey) {
		throw new PlacesError('Address search is not configured', 'SERVER_ERROR', 503);
	}

	const details = await resolveWithProvider(placeId, apiKey, getPlacesProvider());
	if (!details) {
		throw new PlacesError('Could not resolve selected address', 'VALIDATION_ERROR', 422);
	}

	setCachedResolve(details);
	return details;
}
