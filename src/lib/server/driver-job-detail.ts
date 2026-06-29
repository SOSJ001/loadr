import type { SupabaseClient } from '@supabase/supabase-js';
import { getJobForUser } from '$lib/server/jobs';
import type { Database } from '$lib/types/database';
import type { DriverJobDetailPageData } from '$lib/types/driver-job-detail';
import type { UserProfile } from '$lib/types/user';
import { buildDriverJobDetailPageData, parseIssueReasonFromNote } from '$lib/utils/driver-job-detail';

type AppSupabase = SupabaseClient<Database>;

type VehicleRow = {
	make: string | null;
	model: string | null;
	type: string;
};

function formatVehicleLabel(vehicle: VehicleRow): string {
	if (vehicle.make?.trim() && vehicle.model?.trim()) {
		return `${vehicle.make.trim()} ${vehicle.model.trim()}`;
	}

	const labels: Record<string, string> = {
		van: 'Van',
		lorry: 'Lorry',
		hgv: 'HGV',
		other: 'Vehicle'
	};

	return labels[vehicle.type] ?? 'Vehicle';
}

async function getVehicleLabel(
	supabase: AppSupabase,
	vehicleId: string | null
): Promise<string | null> {
	if (!vehicleId) return null;

	const { data, error } = await supabase
		.from('vehicles')
		.select('make, model, type')
		.eq('id', vehicleId)
		.maybeSingle();

	if (error || !data) return null;

	return formatVehicleLabel(data as VehicleRow);
}

export async function fetchVehicleLabelsByIds(
	supabase: AppSupabase,
	vehicleIds: string[]
): Promise<Record<string, string>> {
	const uniqueIds = [...new Set(vehicleIds.filter(Boolean))];
	if (uniqueIds.length === 0) return {};

	const { data, error } = await supabase
		.from('vehicles')
		.select('id, make, model, type')
		.in('id', uniqueIds);

	if (error || !data) return {};

	return Object.fromEntries(
		data.map((vehicle) => [vehicle.id, formatVehicleLabel(vehicle as VehicleRow)])
	);
}

async function getPodCompletedAt(
	supabase: AppSupabase,
	jobId: string
): Promise<string | null> {
	const { data, error } = await supabase
		.from('proof_of_delivery')
		.select('completed_at')
		.eq('job_id', jobId)
		.maybeSingle();

	if (error || !data) return null;

	return data.completed_at;
}

async function getAttemptedIssue(
	supabase: AppSupabase,
	companyId: string,
	jobId: string
): Promise<{ reason: string; attemptedAt: string } | null> {
	const { data, error } = await supabase
		.from('job_status_history')
		.select('note, created_at')
		.eq('job_id', jobId)
		.eq('company_id', companyId)
		.eq('new_status', 'attempted')
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error || !data) return null;

	return {
		reason: parseIssueReasonFromNote(data.note),
		attemptedAt: data.created_at
	};
}

export async function fetchDriverJobDetailPageData(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string
): Promise<DriverJobDetailPageData | null> {
	const job = await getJobForUser(supabase, profile, jobId);
	if (!job) return null;

	const vehicleLabel = await getVehicleLabel(supabase, job.assigned_vehicle_id);
	const [deliveredAt, attemptedIssue] = await Promise.all([
		job.status === 'complete' ? getPodCompletedAt(supabase, jobId) : Promise.resolve(null),
		job.status === 'attempted'
			? getAttemptedIssue(supabase, profile.company_id, jobId)
			: Promise.resolve(null)
	]);

	return buildDriverJobDetailPageData(job, vehicleLabel, {
		deliveredAt,
		issueReason: attemptedIssue?.reason ?? null,
		attemptedAt: attemptedIssue?.attemptedAt ?? null
	});
}
