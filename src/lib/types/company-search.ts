export type CompanyHouseStatus = 'active' | 'dissolved';

export type CompanyHouseResult = {
	name: string;
	number: string;
	status: CompanyHouseStatus;
};
