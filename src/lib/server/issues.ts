import type { SupabaseClient } from '@supabase/supabase-js';
import { JobsError, getJobForUser, recordJobStatusChange } from '$lib/server/jobs';
import { notifyDeliveryAttempted } from '$lib/server/notifications';
import { uploadJobFile } from '$lib/server/storage';
import type { Database } from '$lib/types/database';
import { DRIVER_ISSUE_REASONS } from '$lib/types/driver-job-flow';
import { REPORT_ISSUE_NOTES_MAX_LENGTH } from '$lib/types/driver-report-issue';
import type { UserProfile } from '$lib/types/user';

type JobRow = Database['public']['Tables']['jobs']['Row'];
type AppSupabase = SupabaseClient<Database>;

export const ISSUE_REASONS = DRIVER_ISSUE_REASONS;

export type IssueReason = (typeof ISSUE_REASONS)[number];

export type ReportJobIssueInput = {
	reason: string;
	notes?: string | null;
	photo?: File | null;
};

function assertDriver(profile: UserProfile): void {
	if (profile.role !== 'driver') {
		throw new JobsError('Forbidden', 'FORBIDDEN', 403);
	}
}

function formatIssueNote(reason: string, notes?: string | null): string {
	const trimmedNotes = notes?.trim();
	if (!trimmedNotes) return reason;
	return `${reason} — ${trimmedNotes}`;
}

function validateReason(reason: string): void {
	const trimmed = reason.trim();
	if (!trimmed) {
		throw new JobsError('Issue reason is required', 'VALIDATION_ERROR', 400);
	}
	if (!ISSUE_REASONS.includes(trimmed as IssueReason)) {
		throw new JobsError('Invalid issue reason', 'VALIDATION_ERROR', 400);
	}
}

/** Shared parser for report-issue form posts (page action + API replay). */
export function parseReportIssueFormData(formData: FormData): ReportJobIssueInput {
	const reason = String(formData.get('reason') ?? '');
	const otherDescriptionRaw = String(formData.get('other_description') ?? '').trim();
	const notesRaw = String(formData.get('notes') ?? '').trim();
	const combinedNotes = [otherDescriptionRaw, notesRaw].filter(Boolean).join('\n\n');
	const notes = combinedNotes
		? combinedNotes.slice(0, REPORT_ISSUE_NOTES_MAX_LENGTH)
		: null;
	const photoEntry = formData.get('photo');
	const photo = photoEntry instanceof File && photoEntry.size > 0 ? photoEntry : null;

	return { reason, notes, photo };
}

/** Driver reports a delivery issue on an assigned in-progress job. */
export async function reportJobIssue(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string,
	input: ReportJobIssueInput
): Promise<JobRow> {
	assertDriver(profile);

	const existing = await getJobForUser(supabase, profile, jobId);
	if (!existing) {
		throw new JobsError('Job not found', 'NOT_FOUND', 404);
	}

	if (existing.status !== 'in_progress') {
		throw new JobsError(
			'Issues can only be reported for in-progress jobs',
			'VALIDATION_ERROR',
			400
		);
	}

	validateReason(input.reason);

	let attachmentUrl: string | null = null;
	if (input.photo && input.photo.size > 0) {
		try {
			attachmentUrl = await uploadJobFile({
				companyId: existing.company_id,
				jobId: existing.id,
				category: 'issue',
				file: input.photo
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Photo upload failed';
			throw new JobsError(message, 'VALIDATION_ERROR', 400);
		}
	}

	const { data, error } = await supabase
		.from('jobs')
		.update({ status: 'attempted' })
		.eq('id', jobId)
		.select('*')
		.single();

	if (error) throw error;

	await recordJobStatusChange(supabase, {
		jobId: existing.id,
		companyId: existing.company_id,
		changedBy: profile.id,
		oldStatus: existing.status,
		newStatus: 'attempted',
		note: formatIssueNote(input.reason.trim(), input.notes),
		attachmentUrl
	});

	await notifyDeliveryAttempted(supabase, {
		companyId: existing.company_id,
		jobId: existing.id,
		reference: existing.reference,
		reason: input.reason.trim(),
		driverName: profile.full_name
	});

	return data;
}
