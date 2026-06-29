import type { Database } from '$lib/types/database';
import { utcIsoToScheduleFormValues } from '$lib/utils/create-job-datetime';
import type { CreateJobFormSeed, CreateJobUnsavedValues } from '$lib/utils/operator-create-job';

type JobRow = Database['public']['Tables']['jobs']['Row'];

export function formatEditJobReference(reference: string) {
	return reference.startsWith('#') ? reference : `#${reference}`;
}

export function jobToEditFormSeed(job: JobRow): CreateJobFormSeed {
	const { scheduleDate, scheduleTime } = utcIsoToScheduleFormValues(job.scheduled_at);

	return {
		pickupAddress: job.pickup_address,
		dropoffAddress: job.dropoff_address,
		pickupLat: job.pickup_lat,
		pickupLng: job.pickup_lng,
		dropoffLat: job.dropoff_lat,
		dropoffLng: job.dropoff_lng,
		scheduleDate,
		scheduleTime,
		driverId: job.assigned_driver_id ?? '',
		notes: job.notes ?? ''
	};
}

export function editFormValuesFromSeed(seed: CreateJobFormSeed): CreateJobUnsavedValues {
	return {
		pickupAddress: seed.pickupAddress ?? '',
		pickupLat: seed.pickupLat ?? null,
		pickupLng: seed.pickupLng ?? null,
		dropoffAddress: seed.dropoffAddress ?? '',
		dropoffLat: seed.dropoffLat ?? null,
		dropoffLng: seed.dropoffLng ?? null,
		scheduleDate: seed.scheduleDate ?? '',
		scheduleTime: seed.scheduleTime ?? '',
		driverId: seed.driverId ?? '',
		notes: seed.notes ?? ''
	};
}

export function hasEditJobUnsavedChanges(
	current: CreateJobUnsavedValues,
	initial: CreateJobUnsavedValues
): boolean {
	return (
		current.pickupAddress !== initial.pickupAddress ||
		current.pickupLat !== initial.pickupLat ||
		current.pickupLng !== initial.pickupLng ||
		current.dropoffAddress !== initial.dropoffAddress ||
		current.dropoffLat !== initial.dropoffLat ||
		current.dropoffLng !== initial.dropoffLng ||
		current.scheduleDate !== initial.scheduleDate ||
		current.scheduleTime !== initial.scheduleTime ||
		current.driverId !== initial.driverId ||
		current.notes !== initial.notes
	);
}
