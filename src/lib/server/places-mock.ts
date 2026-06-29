import { env } from '$env/dynamic/private';
import type { AddressSuggestion } from '$lib/server/places';

const MOCK_ADDRESSES: AddressSuggestion[] = [
	{
		placeId: 'mock-poplar-gGrove',
		address: '08 Poplar Grove, Stockport SK2 7JD, UK',
		lat: 51.5034,
		lng: -0.1276
	},
	{
		placeId: 'mock-buckingham-palace',
		address: 'Buckingham Palace, London SW1A 1AA, UK',
		lat: 51.5014,
		lng: -0.1419
	},
	{
		placeId: 'mock-manchester-piccadilly',
		address: 'Piccadilly, Manchester M1 2DT, UK',
		lat: 53.4774,
		lng: -2.2309
	},
	{
		placeId: 'mock-edinburgh-castle',
		address: 'Edinburgh Castle, Edinburgh EH1 2NG, UK',
		lat: 55.9486,
		lng: -3.1999
	},
	{
		placeId: 'mock-cardiff-central',
		address: 'Central Square, Cardiff CF10 1FS, UK',
		lat: 51.4756,
		lng: -3.1791
	},
	{
		placeId: 'mock-birmingham-new-st',
		address: 'New Street, Birmingham B2 4QA, UK',
		lat: 52.4778,
		lng: -1.8983
	}
];

export function isPlacesMockEnabled(): boolean {
	return env.GOOGLE_PLACES_MOCK === 'true';
}

export function mockSearchAddress(query: string): AddressSuggestion[] {
	const needle = query.trim().toLowerCase();
	if (!needle) return [];

	return MOCK_ADDRESSES.filter((entry) => entry.address.toLowerCase().includes(needle))
		.map(({ address, placeId }) => ({ address, placeId }))
		.slice(0, 5);
}

export function mockResolveAddress(placeId: string): AddressSuggestion | null {
	return MOCK_ADDRESSES.find((entry) => entry.placeId === placeId) ?? null;
}
