import type { Database } from '$lib/types/database';
import type { DriverJobStartedPageData } from '$lib/types/driver-job-started';
import {
	formatDriverJobTime,
	formatJobReference
} from '$lib/utils/driver-job-detail';
import { destinationLabelFromAddress } from '$lib/utils/driver-jobs';

type JobRow = Database['public']['Tables']['jobs']['Row'];

export function jobNotesIndicateFragile(notes: string | null): boolean {
	if (!notes) return false;
	return /\bfragile\b/i.test(notes);
}

export function buildDriverJobStartedPageData(job: JobRow): DriverJobStartedPageData {
	return {
		id: job.id,
		reference: formatJobReference(job.reference),
		pickup_address: job.pickup_address,
		destination_label: destinationLabelFromAddress(job.dropoff_address),
		started_at_label: job.started_at ? formatDriverJobTime(job.started_at) : '—',
		scheduled_time_label: formatDriverJobTime(job.scheduled_at),
		show_fragile_tag: jobNotesIndicateFragile(job.notes)
	};
}
