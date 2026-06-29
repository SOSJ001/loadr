import type { DriverLastActive } from '$lib/types/drivers';

function startOfDay(date: Date) {
	const copy = new Date(date);
	copy.setHours(0, 0, 0, 0);
	return copy;
}

export function formatDriverLastActive(lastActiveAt: string | null): DriverLastActive | null {
	if (!lastActiveAt) return null;

	const date = new Date(lastActiveAt);
	const today = startOfDay(new Date());
	const target = startOfDay(date);
	const diffDays = Math.round((today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000));

	if (diffDays === 0) {
		const time = date.toLocaleTimeString('en-GB', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
		return { primary: 'Today', secondary: `at ${time.toLowerCase()}` };
	}

	if (diffDays === 1) {
		return { primary: 'Yesterday' };
	}

	if (diffDays < 7) {
		return { primary: `${diffDays} days ago` };
	}

	return {
		primary: date.toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short'
		})
	};
}

export function formatDriverAddedDate(value: string): string {
	const date = new Date(value);
	return `Added ${date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	})}`;
}

export function formatDriverProfileDate(value: string): string {
	return new Date(value).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
}

export function driverMatchesSearch(
	driver: { full_name: string; phone: string },
	query: string
): boolean {
	const needle = query.trim().toLowerCase();
	if (!needle) return true;

	return (
		driver.full_name.toLowerCase().includes(needle) ||
		driver.phone.replace(/\s+/g, '').includes(needle.replace(/\s+/g, ''))
	);
}
