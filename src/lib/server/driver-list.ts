import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';
import type { DriverListRow, DriversPageData } from '$lib/types/drivers';
import { FREE_DRIVER_LIMIT } from '$lib/server/users';
import { formatDriverLastActive } from '$lib/utils/drivers';

type AppSupabase = SupabaseClient<Database>;
type DriverRow = Database['public']['Tables']['users']['Row'];

export type DriverListJobStats = {
	jobsThisMonthByDriver: Map<string, number>;
	jobsThisMonth: number;
	onJobNow: number;
};

function startOfMonth(date: Date) {
	const copy = new Date(date);
	copy.setDate(1);
	copy.setHours(0, 0, 0, 0);
	return copy;
}

export async function fetchDriverListJobStats(
	supabase: AppSupabase,
	companyId: string
): Promise<DriverListJobStats> {
	const monthStart = startOfMonth(new Date()).toISOString();

	const { data: jobs, error } = await supabase
		.from('jobs')
		.select('assigned_driver_id, status, scheduled_at')
		.eq('company_id', companyId);

	if (error) throw error;

	const jobsThisMonthByDriver = new Map<string, number>();
	let jobsThisMonth = 0;
	let onJobNow = 0;

	for (const job of jobs ?? []) {
		if (job.status === 'in_progress') {
			onJobNow++;
		}

		if (job.scheduled_at >= monthStart) {
			jobsThisMonth++;
			if (job.assigned_driver_id) {
				jobsThisMonthByDriver.set(
					job.assigned_driver_id,
					(jobsThisMonthByDriver.get(job.assigned_driver_id) ?? 0) + 1
				);
			}
		}
	}

	return { jobsThisMonthByDriver, jobsThisMonth, onJobNow };
}

export function mapDriverToListRow(
	row: DriverRow,
	jobsThisMonth = 0
): DriverListRow {
	const pending = row.status === 'pending';
	const active = row.status === 'active';

	return {
		id: row.id,
		full_name: row.full_name,
		phone: row.phone ?? '',
		status: active ? 'active' : 'pending',
		status_detail: pending ? 'Invite sent' : undefined,
		jobs_this_month: jobsThisMonth,
		added_at: row.created_at,
		last_active: formatDriverLastActive(row.last_active_at),
		show_copy_phone: active && Boolean(row.phone?.trim()),
		actions: {
			view: true,
			resend: pending,
			more: active
		}
	};
}

export function buildDriversPageData(
	drivers: DriverRow[],
	plan: 'free' | 'pro',
	jobStats?: DriverListJobStats
): DriversPageData {
	const rows = drivers.map((row) =>
		mapDriverToListRow(row, jobStats?.jobsThisMonthByDriver.get(row.id) ?? 0)
	);
	const active = rows.filter((d) => d.status === 'active').length;
	const pending = rows.filter((d) => d.status === 'pending').length;

	return {
		plan,
		slotUsage: {
			used: rows.length,
			limit: plan === 'free' ? FREE_DRIVER_LIMIT : 999
		},
		stats: {
			active,
			pending,
			jobsThisMonth: jobStats?.jobsThisMonth ?? 0,
			onJobNow: jobStats?.onJobNow ?? 0
		},
		drivers: rows
	};
}
