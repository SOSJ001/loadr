import {
	formatScheduleDateDisplay,
	formatScheduleTimeDisplay,
	zonedWallTimeToUtcIso
} from '$lib/utils/create-job-datetime';

export function formatCreateJobPreviewDate(dateValue: string): string {
	return formatScheduleDateDisplay(dateValue);
}

export function formatCreateJobPreviewTime(timeValue: string): string {
	return formatScheduleTimeDisplay(timeValue);
}

export function combineScheduledAt(dateValue: string, timeValue: string): string {
	return zonedWallTimeToUtcIso(dateValue, timeValue);
}

export type ParsedCreateJobFormData = {
	pickupAddress: string;
	dropoffAddress: string;
	pickupLat: number;
	pickupLng: number;
	dropoffLat: number;
	dropoffLng: number;
	scheduleDate: string;
	scheduleTime: string;
	assignedDriverId: string;
	notes: string;
};

function parseCoord(value: FormDataEntryValue | null): number {
	if (value == null || value === '') return Number.NaN;
	return Number(value);
}

export function parseCreateJobFormData(formData: FormData): ParsedCreateJobFormData {
	return {
		pickupAddress: String(formData.get('pickup_address') ?? '').trim(),
		dropoffAddress: String(formData.get('dropoff_address') ?? '').trim(),
		pickupLat: parseCoord(formData.get('pickup_lat')),
		pickupLng: parseCoord(formData.get('pickup_lng')),
		dropoffLat: parseCoord(formData.get('dropoff_lat')),
		dropoffLng: parseCoord(formData.get('dropoff_lng')),
		scheduleDate: String(formData.get('schedule_date') ?? '').trim(),
		scheduleTime: String(formData.get('schedule_time') ?? '').trim(),
		assignedDriverId: String(formData.get('assigned_driver_id') ?? '').trim(),
		notes: String(formData.get('notes') ?? '').trim()
	};
}

export function createJobSeedFromSubmission(
	data: ParsedCreateJobFormData
): CreateJobFormSeed {
	return {
		pickupAddress: data.pickupAddress,
		dropoffAddress: data.dropoffAddress,
		pickupLat: Number.isNaN(data.pickupLat) ? null : data.pickupLat,
		pickupLng: Number.isNaN(data.pickupLng) ? null : data.pickupLng,
		dropoffLat: Number.isNaN(data.dropoffLat) ? null : data.dropoffLat,
		dropoffLng: Number.isNaN(data.dropoffLng) ? null : data.dropoffLng,
		scheduleDate: data.scheduleDate || undefined,
		scheduleTime: data.scheduleTime || undefined,
		driverId: data.assignedDriverId || undefined,
		notes: data.notes || undefined
	};
}

export function isCreateJobSubmissionValid(data: ParsedCreateJobFormData): boolean {
	return Boolean(
		data.pickupAddress &&
			data.dropoffAddress &&
			data.scheduleDate &&
			data.scheduleTime &&
			data.assignedDriverId &&
			!Number.isNaN(data.pickupLat) &&
			!Number.isNaN(data.pickupLng) &&
			!Number.isNaN(data.dropoffLat) &&
			!Number.isNaN(data.dropoffLng)
	);
}

export type CreateJobDriverOption = {
	id: string;
	full_name: string;
};

export type CreateJobFormSeed = {
	pickupAddress: string;
	dropoffAddress: string;
	pickupLat?: number | null;
	pickupLng?: number | null;
	dropoffLat?: number | null;
	dropoffLng?: number | null;
	scheduleDate?: string;
	scheduleTime?: string;
	driverId?: string;
	notes?: string;
};

/** Figma 7B — Create Job (Partial). */
export function getCreateJobPartialSeed(): CreateJobFormSeed {
	return {
		pickupAddress: '14 Bold Street, Liverpool, L1 4AF',
		dropoffAddress: '88 Park Street, Bath, BA1 2AE',
		pickupLat: 53.4042,
		pickupLng: -2.9789,
		dropoffLat: 51.3811,
		dropoffLng: -2.359
	};
}

/** Figma 7C / 7E — Create Job (Filled). */
export function getCreateJobFilledSeed(driverId = 'mock-driver-1'): CreateJobFormSeed {
	return {
		...getCreateJobPartialSeed(),
		scheduleDate: '2026-06-09',
		scheduleTime: '09:30',
		driverId,
		notes: 'Fragile, leave at reception'
	};
}

export function resolveCreateJobSeed(
	preview: string | null,
	drivers: CreateJobDriverOption[]
): CreateJobFormSeed | null {
	if (preview === 'partial' || preview === 'discard' || preview === 'dark-discard') {
		return getCreateJobPartialSeed();
	}

	if (preview === 'filled' || preview === 'populated' || preview === 'dark') {
		const james =
			drivers.find((driver) => driver.full_name === 'James Okafor')?.id ?? drivers[0]?.id;
		return getCreateJobFilledSeed(james ?? 'mock-driver-1');
	}

	return null;
}

export const CREATE_JOB_REQUIRED_MESSAGE = 'This field is required';

export type CreateJobFieldErrors = {
	pickup?: string;
	dropoff?: string;
	scheduleDate?: string;
	scheduleTime?: string;
	driver?: string;
};

export type CreateJobFormValues = {
	pickupAddress: string;
	pickupLat: number | null;
	pickupLng: number | null;
	dropoffAddress: string;
	dropoffLat: number | null;
	dropoffLng: number | null;
	scheduleDate: string;
	scheduleTime: string;
	driverId: string;
};

export function validateCreateJobForm(values: CreateJobFormValues): CreateJobFieldErrors {
	const errors: CreateJobFieldErrors = {};

	if (
		!values.pickupAddress.trim() ||
		values.pickupLat == null ||
		values.pickupLng == null
	) {
		errors.pickup = CREATE_JOB_REQUIRED_MESSAGE;
	}

	if (
		!values.dropoffAddress.trim() ||
		values.dropoffLat == null ||
		values.dropoffLng == null
	) {
		errors.dropoff = CREATE_JOB_REQUIRED_MESSAGE;
	}

	if (!values.scheduleDate) {
		errors.scheduleDate = CREATE_JOB_REQUIRED_MESSAGE;
	}

	if (!values.scheduleTime) {
		errors.scheduleTime = CREATE_JOB_REQUIRED_MESSAGE;
	}

	if (!values.driverId) {
		errors.driver = CREATE_JOB_REQUIRED_MESSAGE;
	}

	return errors;
}

export function hasCreateJobFieldErrors(errors: CreateJobFieldErrors): boolean {
	return Object.keys(errors).length > 0;
}

export type CreateJobUnsavedValues = CreateJobFormValues & {
	notes: string;
};

export function hasCreateJobUnsavedChanges(values: CreateJobUnsavedValues): boolean {
	return Boolean(
		values.pickupAddress.trim() ||
			values.dropoffAddress.trim() ||
			values.scheduleDate ||
			values.scheduleTime ||
			values.driverId ||
			values.notes.trim()
	);
}
