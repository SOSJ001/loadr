export type UserRole = 'admin' | 'driver';
export type UserStatus = 'pending' | 'active';

export type UserProfile = {
	id: string;
	company_id: string;
	full_name: string;
	email: string;
	phone: string | null;
	role: UserRole;
	status: UserStatus;
	removed_at: string | null;
};
