import type { OperatorJobListRow } from '$lib/types/operator-jobs';
import { getScheduleTimezoneDateKey, SCHEDULE_TIMEZONE } from '$lib/utils/create-job-datetime';

export type JobStatusFilter = 'all' | 'pending' | 'in_progress' | 'complete' | 'attempted';
export type JobDateFilter = 'any' | 'today' | 'week';

export function jobMatchesSearch(job: OperatorJobListRow, query: string): boolean {
	const trimmed = query.trim().toLowerCase();
	if (!trimmed) return true;

	const haystack = [
		job.reference,
		job.pickup_address,
		job.dropoff_address,
		job.driver_name ?? ''
	]
		.join(' ')
		.toLowerCase();

	return haystack.includes(trimmed);
}

export function jobMatchesStatusFilter(job: OperatorJobListRow, filter: JobStatusFilter): boolean {
	if (filter === 'all') return true;
	return job.status === filter;
}

export function jobMatchesDriverFilter(job: OperatorJobListRow, driverId: string): boolean {
	if (driverId === 'all') return true;
	return job.driver_id === driverId;
}

export function jobMatchesDateFilter(job: OperatorJobListRow, filter: JobDateFilter): boolean {
	if (filter === 'any') return true;

	const scheduled = new Date(job.scheduled_at);
	const now = new Date();
	const today = new Date(now);
	today.setHours(0, 0, 0, 0);

	if (filter === 'today') {
		const target = new Date(scheduled);
		target.setHours(0, 0, 0, 0);
		return target.getTime() === today.getTime();
	}

	const weekStart = new Date(today);
	weekStart.setDate(today.getDate() - today.getDay());
	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekStart.getDate() + 7);

	return scheduled >= weekStart && scheduled < weekEnd;
}

export function statusFilterLabel(filter: JobStatusFilter): string {
	switch (filter) {
		case 'all':
			return 'All Statuses';
		case 'pending':
			return 'Pending';
		case 'in_progress':
			return 'In Progress';
		case 'complete':
			return 'Complete';
		case 'attempted':
			return 'Attempted';
	}
}

export function dateFilterLabel(filter: JobDateFilter): string {
	switch (filter) {
		case 'any':
			return 'Any date';
		case 'today':
			return 'Today';
		case 'week':
			return 'This week';
	}
}

export function splitJobAddress(address: string): { line1: string; line2: string } {
	const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
	if (parts.length >= 2) {
		return { line1: parts[0], line2: parts.slice(1).join(', ') };
	}
	return { line1: address, line2: '' };
}

export function jobAddressLines(job: {
	pickup_address: string;
	dropoff_address: string;
	pickup_line1?: string;
	pickup_line2?: string;
	dropoff_line1?: string;
	dropoff_line2?: string;
}) {
	const pickup =
		job.pickup_line1 != null
			? { line1: job.pickup_line1, line2: job.pickup_line2 ?? '' }
			: splitJobAddress(job.pickup_address);
	const dropoff =
		job.dropoff_line1 != null
			? { line1: job.dropoff_line1, line2: job.dropoff_line2 ?? '' }
			: splitJobAddress(job.dropoff_address);
	return { pickup, dropoff };
}

export function formatOperatorJobDateTime(iso: string): { date: string; time: string } {
	const date = new Date(iso);
	const todayKey = getScheduleTimezoneDateKey();
	const targetKey = getScheduleTimezoneDateKey(date);

	const dateLabel =
		targetKey === todayKey
			? 'Today'
			: date.toLocaleDateString('en-GB', {
					day: 'numeric',
					month: 'short',
					year: 'numeric',
					timeZone: SCHEDULE_TIMEZONE
				});

	const timeLabel = date
		.toLocaleTimeString('en-GB', {
			timeZone: SCHEDULE_TIMEZONE,
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		})
		.replace(/\s/g, '')
		.toLowerCase();

	return { date: dateLabel, time: timeLabel };
}

export function paginationRangeLabel(
	currentPage: number,
	pageSize: number,
	resultCount: number
): string {
	if (resultCount === 0) {
		return 'Showing 0 of 0 jobs';
	}

	const start = (currentPage - 1) * pageSize + 1;
	const end = Math.min(currentPage * pageSize, resultCount);

	return `Showing ${start}–${end} of ${resultCount} jobs`;
}

export function paginationPageNumbers(
	currentPage: number,
	totalPages: number,
	maxVisible = 3
): number[] {
	if (totalPages <= maxVisible) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	if (currentPage <= 2) {
		return Array.from({ length: maxVisible }, (_, index) => index + 1);
	}

	if (currentPage >= totalPages - 1) {
		return Array.from({ length: maxVisible }, (_, index) => totalPages - maxVisible + index + 1);
	}

	return [currentPage - 1, currentPage, currentPage + 1];
}
