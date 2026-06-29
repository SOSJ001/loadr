const dateFormatter = new Intl.DateTimeFormat('en-GB', {
	dateStyle: 'medium',
	timeStyle: 'short'
});

export function formatDate(value: string | Date): string {
	return dateFormatter.format(typeof value === 'string' ? new Date(value) : value);
}
