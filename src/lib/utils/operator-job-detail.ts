import { SCHEDULE_TIMEZONE } from '$lib/utils/create-job-datetime';

export function formatJobDetailCreatedAt(iso: string): string {
	const date = new Date(iso);
	const datePart = date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
	const timePart = date
		.toLocaleTimeString('en-GB', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		})
		.replace(/\s/g, '')
		.toLowerCase();

	return `Created ${datePart} at ${timePart}`;
}

export function formatJobDetailScheduledDate(iso: string): string {
	return new Date(iso).toLocaleDateString('en-GB', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: SCHEDULE_TIMEZONE
	});
}

export function formatJobDetailScheduledTime(iso: string): string {
	return new Date(iso)
		.toLocaleTimeString('en-GB', {
			timeZone: SCHEDULE_TIMEZONE,
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		})
		.replace(/\s/g, '')
		.toLowerCase();
}

export function formatJobDetailTimelineTimestamp(iso: string): string {
	const date = new Date(iso);
	const datePart = date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short'
	});
	const timePart = date
		.toLocaleTimeString('en-GB', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		})
		.replace(/\s/g, '')
		.toLowerCase();

	return `${datePart}, ${timePart}`;
}

export function formatJobDetailPodTimestamp(iso: string): string {
	const date = new Date(iso);
	const datePart = date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
	const timePart = date
		.toLocaleTimeString('en-GB', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		})
		.replace(/\s/g, '')
		.toLowerCase();

	return `${datePart}, ${timePart}`;
}

export function formatJobDetailCurrency(value: number): string {
	return new Intl.NumberFormat('en-GB', {
		style: 'currency',
		currency: 'GBP'
	}).format(value);
}
