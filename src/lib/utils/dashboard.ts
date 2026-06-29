export function driverInitials(name: string) {
	return (
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((word) => word[0]?.toUpperCase() ?? '')
			.join('') || '?'
	);
}

export function formatDashboardDate(value: string) {
	const date = new Date(value);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const target = new Date(date);
	target.setHours(0, 0, 0, 0);

	if (target.getTime() === today.getTime()) {
		return 'Today';
	}

	return date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short'
	});
}
