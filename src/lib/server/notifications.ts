import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

type AppSupabase = SupabaseClient<Database>;

type NotifyJobAssignedInput = {
	companyId: string;
	driverUserId: string;
	jobId: string;
	reference: string;
	pickupAddress: string;
	scheduledAt: string;
};

function formatReference(reference: string): string {
	return reference.startsWith('#') ? reference : `#${reference}`;
}

/** In-app notification when a job is assigned to a driver. */
export async function notifyJobAssigned(
	supabase: AppSupabase,
	input: NotifyJobAssignedInput
): Promise<void> {
	const ref = formatReference(input.reference);
	const scheduled = new Date(input.scheduledAt).toLocaleString('en-GB', {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});

	const { error } = await supabase.from('notifications').insert({
		company_id: input.companyId,
		user_id: input.driverUserId,
		type: 'job_assigned',
		title: `New job ${ref} assigned`,
		body: `Pickup: ${input.pickupAddress}. Scheduled ${scheduled}.`,
		job_id: input.jobId
	});

	if (error) throw error;
}

type NotifyDeliveryAttemptedInput = {
	companyId: string;
	jobId: string;
	reference: string;
	reason: string;
	driverName: string;
};

/** In-app notification to company admins when a driver reports a delivery issue. */
export async function notifyDeliveryAttempted(
	supabase: AppSupabase,
	input: NotifyDeliveryAttemptedInput
): Promise<void> {
	const ref = formatReference(input.reference);

	const { data: admins, error: adminsError } = await supabase
		.from('users')
		.select('id')
		.eq('company_id', input.companyId)
		.eq('role', 'admin');

	if (adminsError) throw adminsError;
	if (!admins?.length) return;

	const rows = admins.map((admin) => ({
		company_id: input.companyId,
		user_id: admin.id,
		type: 'delivery_attempted' as const,
		title: `Delivery attempted on ${ref}`,
		body: `${input.driverName} reported: ${input.reason}`,
		job_id: input.jobId
	}));

	const { error } = await supabase.from('notifications').insert(rows);
	if (error) throw error;
}

type NotifyJobCompleteInput = {
	companyId: string;
	jobId: string;
	reference: string;
	driverName: string;
};

/** In-app notification to company admins when a driver completes a delivery. */
export async function notifyJobComplete(
	supabase: AppSupabase,
	input: NotifyJobCompleteInput
): Promise<void> {
	const ref = formatReference(input.reference);

	const { data: admins, error: adminsError } = await supabase
		.from('users')
		.select('id')
		.eq('company_id', input.companyId)
		.eq('role', 'admin');

	if (adminsError) throw adminsError;
	if (!admins?.length) return;

	const rows = admins.map((admin) => ({
		company_id: input.companyId,
		user_id: admin.id,
		type: 'job_complete' as const,
		title: `Job ${ref} completed`,
		body: `${input.driverName} completed the delivery.`,
		job_id: input.jobId
	}));

	const { error } = await supabase.from('notifications').insert(rows);
	if (error) throw error;
}

/** Group 10 — Notifications. */
export async function listNotificationsForUser(
	_supabase: AppSupabase,
	_profile: unknown,
	_options?: { isRead?: boolean; limit?: number }
) {
	throw new Error('Not implemented');
}

export async function markNotificationRead(
	_supabase: AppSupabase,
	_profile: unknown,
	_notificationId: string
) {
	throw new Error('Not implemented');
}

export async function markAllNotificationsRead(_supabase: AppSupabase, _profile: unknown) {
	throw new Error('Not implemented');
}
