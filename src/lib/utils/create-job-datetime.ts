/** Wall-clock timezone for operator schedule entry (GMT / BST). */
export const SCHEDULE_TIMEZONE = 'Europe/London';

export function toDateKey(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
	const [year, month, day] = dateKey.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export type CalendarCell = {
	dateKey: string;
	day: number;
	inMonth: boolean;
	isToday: boolean;
};

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function getWeekdayLabels(): string[] {
	return WEEKDAY_LABELS;
}

export function getScheduleTimezoneDateKey(date: Date = new Date()): string {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat('en-US', {
			timeZone: SCHEDULE_TIMEZONE,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		})
			.formatToParts(date)
			.filter((part) => part.type !== 'literal')
			.map((part) => [part.type, part.value])
	) as { year: string; month: string; day: string };

	return `${parts.year}-${parts.month}-${parts.day}`;
}

export function buildCalendarMonth(viewMonth: Date): CalendarCell[] {
	const year = viewMonth.getFullYear();
	const month = viewMonth.getMonth();
	const todayKey = getScheduleTimezoneDateKey();

	const firstOfMonth = new Date(year, month, 1);
	const startOffset = (firstOfMonth.getDay() + 6) % 7;
	const gridStart = new Date(year, month, 1 - startOffset);

	const cells: CalendarCell[] = [];

	for (let index = 0; index < 42; index += 1) {
		const date = new Date(gridStart);
		date.setDate(gridStart.getDate() + index);
		const dateKey = toDateKey(date);

		cells.push({
			dateKey,
			day: date.getDate(),
			inMonth: date.getMonth() === month,
			isToday: dateKey === todayKey
		});
	}

	return cells;
}

export function formatCalendarMonthLabel(viewMonth: Date): string {
	return viewMonth.toLocaleDateString('en-GB', {
		month: 'long',
		year: 'numeric',
		timeZone: SCHEDULE_TIMEZONE
	});
}

export function shiftCalendarMonth(viewMonth: Date, delta: number): Date {
	return new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1);
}

export type ParsedTimeValue = { hour12: number; minute: number; period: 'am' | 'pm' };

export function parseTimeValue(value: string): ParsedTimeValue | null {
	if (!value) return null;

	const [hours, minutes] = value.split(':').map(Number);
	if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

	const period: 'am' | 'pm' = hours >= 12 ? 'pm' : 'am';
	const hour12 = hours % 12 || 12;

	return { hour12, minute: minutes, period };
}

export function composeTimeValue(hour12: number, minute: number, period: 'am' | 'pm'): string {
	let hours = hour12 % 12;
	if (period === 'pm') hours += 12;
	return `${String(hours).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatScheduleTimeDisplay(timeValue: string): string {
	if (!timeValue) return '—';

	const parsed = parseTimeValue(timeValue);
	if (!parsed) return '—';

	return `${parsed.hour12}:${String(parsed.minute).padStart(2, '0')}${parsed.period}`;
}

export function formatScheduleDateDisplay(
	dateValue: string,
	timeZone: string = SCHEDULE_TIMEZONE
): string {
	if (!dateValue) return 'Not set yet';

	const [year, month, day] = dateValue.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

	return date.toLocaleDateString('en-GB', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone
	});
}

/** Convert a UTC ISO timestamp to schedule form date + HH:mm in the operator timezone. */
export function utcIsoToScheduleFormValues(
	iso: string,
	timeZone: string = SCHEDULE_TIMEZONE
): { scheduleDate: string; scheduleTime: string } {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat('en-US', {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		})
			.formatToParts(new Date(iso))
			.filter((part) => part.type !== 'literal')
			.map((part) => [part.type, part.value])
	) as { year: string; month: string; day: string; hour: string; minute: string };

	const hour = Number(parts.hour) === 24 ? 0 : Number(parts.hour);

	return {
		scheduleDate: `${parts.year}-${parts.month}-${parts.day}`,
		scheduleTime: `${String(hour).padStart(2, '0')}:${parts.minute.padStart(2, '0')}`
	};
}

/** Convert schedule date + HH:mm (GMT/BST wall time) to a UTC ISO string. */
export function zonedWallTimeToUtcIso(
	dateKey: string,
	timeValue: string,
	timeZone: string = SCHEDULE_TIMEZONE
): string {
	return zonedWallTimeToUtc(dateKey, timeValue, timeZone).toISOString();
}

export function zonedWallTimeToUtc(
	dateKey: string,
	timeValue: string,
	timeZone: string = SCHEDULE_TIMEZONE
): Date {
	const [year, month, day] = dateKey.split('-').map(Number);
	const [hour, minute] = timeValue.split(':').map(Number);

	const desiredMs = Date.UTC(year, month - 1, day, hour, minute, 0);
	let utcMs = desiredMs;

	for (let attempt = 0; attempt < 5; attempt += 1) {
		const parts = new Intl.DateTimeFormat('en-US', {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		}).formatToParts(new Date(utcMs));

		const values = Object.fromEntries(
			parts
				.filter((part) => part.type !== 'literal')
				.map((part) => [part.type, Number(part.value)])
		);

		const formattedWallMs = Date.UTC(
			values.year,
			values.month - 1,
			values.day,
			values.hour === 24 ? 0 : values.hour,
			values.minute,
			values.second ?? 0
		);

		const diff = desiredMs - formattedWallMs;
		if (diff === 0) break;
		utcMs += diff;
	}

	return new Date(utcMs);
}

export function getScheduleTimezoneNow(): ParsedTimeValue {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat('en-US', {
			timeZone: SCHEDULE_TIMEZONE,
			hour: 'numeric',
			minute: 'numeric',
			hour12: false
		})
			.formatToParts(new Date())
			.filter((part) => part.type !== 'literal')
			.map((part) => [part.type, Number(part.value)])
	) as { hour: number; minute: number };

	const hour24 = parts.hour;
	const minute = Math.round(parts.minute / 5) * 5;
	const normalizedMinute = minute === 60 ? 0 : minute;
	const period: 'am' | 'pm' = hour24 >= 12 ? 'pm' : 'am';
	const hour12 = hour24 % 12 || 12;

	return { hour12, minute: normalizedMinute, period };
}

export const CREATE_JOB_CLOCK_MINUTES = Array.from({ length: 12 }, (_, index) => index * 5);

export type ClockFaceItem = {
	label: string;
	value: number;
	x: number;
	y: number;
};

export function buildClockFacePositions(
	items: { label: string; value: number }[],
	size: number,
	radius: number
): ClockFaceItem[] {
	const center = size / 2;
	const count = items.length;

	return items.map((item, index) => {
		const angleDeg = -90 + (360 / count) * index;
		const angleRad = (angleDeg * Math.PI) / 180;

		return {
			...item,
			x: center + radius * Math.cos(angleRad),
			y: center + radius * Math.sin(angleRad)
		};
	});
}

export const CREATE_JOB_CLOCK_HOURS = Array.from({ length: 12 }, (_, index) => ({
	label: String(index + 1),
	value: index + 1
}));

export const CREATE_JOB_CLOCK_MINUTE_ITEMS = CREATE_JOB_CLOCK_MINUTES.map((minute) => ({
	label: String(minute).padStart(2, '0'),
	value: minute
}));
