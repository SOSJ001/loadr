import type { CompanyHouseResult } from '$lib/types/company-search';

/** UI-only mock data for Companies House search (1D / 1E). Replace with API in Phase 1 wiring. */
export const MOCK_COMPANIES_HOUSE: CompanyHouseResult[] = [
	{ name: "DAVE'S COURIERS LTD", number: '12345678', status: 'active' },
	{ name: 'FASTFREIGHT LOGISTICS PLC', number: '87654321', status: 'active' },
	{ name: 'OLDHAULAGE SERVICES LTD', number: '11223344', status: 'dissolved' }
];

export function searchMockCompanies(query: string): CompanyHouseResult[] {
	const q = query.trim().toLowerCase();
	if (q.length < 2) return [];

	return MOCK_COMPANIES_HOUSE.filter(
		(company) =>
			company.name.toLowerCase().includes(q) || company.number.includes(q)
	);
}

export function findMockCompanyByNumber(number: string): CompanyHouseResult | undefined {
	const trimmed = number.trim();
	if (!trimmed) return undefined;

	return MOCK_COMPANIES_HOUSE.find((company) => company.number === trimmed);
}
