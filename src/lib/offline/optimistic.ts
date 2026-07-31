import {
	getCachedJobDetail,
	getCachedJobFlow,
	getCachedJobStarted,
	getCachedJobsList,
	setCachedJobDetail,
	setCachedJobFlow,
	setCachedJobStarted,
	setCachedJobsList
} from '$lib/offline/page-cache';
import type { Database } from '$lib/types/database';
import type { DriverJobDetailPageData } from '$lib/types/driver-job-detail';
import type { DriverJobListItem, DriverJobsPageData } from '$lib/types/driver-jobs';
import type { JobStatus } from '$lib/types/job';
import {
	buildDriverJobDetailPageData
} from '$lib/utils/driver-job-detail';
import { buildDriverJobStartedPageData } from '$lib/utils/driver-job-started';
import { destinationLabelFromAddress } from '$lib/utils/driver-jobs';

type JobRow = Database['public']['Tables']['jobs']['Row'];

function stripReferencePrefix(reference: string): string {
	return reference.startsWith('#') ? reference.slice(1) : reference;
}

function detailToJobRow(
	detail: DriverJobDetailPageData,
	overrides: Partial<JobRow> = {}
): JobRow {
	const now = new Date().toISOString();
	return {
		id: detail.id,
		reference: stripReferencePrefix(detail.reference),
		status: detail.status,
		pickup_address: detail.pickup_address,
		dropoff_address: detail.dropoff_address,
		notes: detail.notes,
		scheduled_at: now,
		started_at: null,
		completed_at: null,
		created_at: now,
		company_id: '',
		assigned_driver_id: null,
		assigned_vehicle_id: null,
		updated_at: now,
		...overrides
	} as JobRow;
}

function detailToFlowContext(detail: DriverJobDetailPageData) {
	return {
		id: detail.id,
		reference: detail.reference,
		pickup_address: detail.pickup_address,
		dropoff_address: detail.dropoff_address
	};
}

function updateListJobStatus(
	list: DriverJobsPageData,
	jobId: string,
	status: JobStatus
): DriverJobsPageData {
	const patch = (jobs: DriverJobListItem[]) =>
		jobs.map((job) => (job.id === jobId ? { ...job, status } : job));

	const morning = patch(list.morning_jobs);
	const afternoon = patch(list.afternoon_jobs);
	const allJobs = [...morning, ...afternoon];

	const stats = allJobs.reduce(
		(acc, job) => {
			if (job.status === 'pending' || job.status === 'attempted') acc.pending += 1;
			if (job.status === 'in_progress') acc.in_progress += 1;
			if (job.status === 'complete') acc.complete += 1;
			return acc;
		},
		{ pending: 0, in_progress: 0, complete: 0 }
	);

	let active_job = list.active_job;
	if (status === 'in_progress') {
		const job = allJobs.find((item) => item.id === jobId);
		if (job) {
			active_job = {
				id: job.id,
				reference: job.reference,
				destination_label: destinationLabelFromAddress(job.dropoff_address)
			};
		}
	} else if (active_job?.id === jobId) {
		active_job = null;
	}

	return {
		...list,
		morning_jobs: morning,
		afternoon_jobs: afternoon,
		stats,
		active_job
	};
}

async function updateAllCachedLists(jobId: string, status: JobStatus): Promise<void> {
	if (typeof indexedDB === 'undefined') return;

	const db = await new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open('loadr-offline', 2);
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});

	try {
		const store = db.transaction('page-cache', 'readonly').objectStore('page-cache');
		const keys = await new Promise<IDBValidKey[]>((resolve, reject) => {
			const req = store.getAllKeys();
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});

		for (const key of keys) {
			if (typeof key !== 'string' || !key.startsWith('jobs-list:')) continue;
			const list = await getCachedJobsList(key.replace('jobs-list:', ''));
			if (!list) continue;
			const hasJob =
				list.morning_jobs.some((j) => j.id === jobId) ||
				list.afternoon_jobs.some((j) => j.id === jobId);
			if (!hasJob) continue;
			await setCachedJobsList(list.selected_date, updateListJobStatus(list, jobId, status));
		}
	} finally {
		db.close();
	}
}

export async function applyOptimisticStartJob(jobId: string): Promise<void> {
	const detail = await getCachedJobDetail(jobId);
	if (!detail) return;

	const startedAt = new Date().toISOString();
	const jobRow = detailToJobRow(detail, {
		status: 'in_progress',
		started_at: startedAt
	});

	const updatedDetail = buildDriverJobDetailPageData(jobRow, detail.vehicle_label);
	await setCachedJobDetail(jobId, updatedDetail);
	await setCachedJobFlow(jobId, detailToFlowContext(updatedDetail));
	await setCachedJobStarted(jobId, buildDriverJobStartedPageData(jobRow));
	await updateAllCachedLists(jobId, 'in_progress');
}

export async function applyOptimisticCompleteJob(jobId: string): Promise<void> {
	const detail = await getCachedJobDetail(jobId);
	if (!detail) return;

	const completedAt = new Date().toISOString();
	const jobRow = detailToJobRow(detail, {
		status: 'complete',
		completed_at: completedAt,
		started_at: detail.status === 'in_progress' ? completedAt : null
	});

	const updatedDetail = buildDriverJobDetailPageData(jobRow, detail.vehicle_label, {
		deliveredAt: completedAt
	});
	await setCachedJobDetail(jobId, updatedDetail);
	await updateAllCachedLists(jobId, 'complete');
}

export async function applyOptimisticReportIssue(jobId: string, reason: string): Promise<void> {
	const detail = await getCachedJobDetail(jobId);
	if (!detail) return;

	const attemptedAt = new Date().toISOString();
	const jobRow = detailToJobRow(detail, {
		status: 'attempted',
		started_at: detail.status === 'in_progress' ? attemptedAt : null
	});

	const updatedDetail = buildDriverJobDetailPageData(jobRow, detail.vehicle_label, {
		issueReason: reason,
		attemptedAt
	});
	await setCachedJobDetail(jobId, updatedDetail);
	await setCachedJobFlow(jobId, detailToFlowContext(updatedDetail));
	await updateAllCachedLists(jobId, 'attempted');
}

/** Rebuild detail from cache after reading (for display with pending sync state). */
export async function getCachedJobDetailForDisplay(
	jobId: string
): Promise<DriverJobDetailPageData | null> {
	return getCachedJobDetail(jobId);
}

export async function ensureJobFlowCache(jobId: string): Promise<void> {
	const existing = await getCachedJobFlow(jobId);
	if (existing) return;

	const detail = await getCachedJobDetail(jobId);
	if (!detail) return;

	await setCachedJobFlow(jobId, detailToFlowContext(detail));
}

export async function ensureJobStartedCache(jobId: string): Promise<void> {
	const existing = await getCachedJobStarted(jobId);
	if (existing) return;

	const detail = await getCachedJobDetail(jobId);
	if (!detail) return;

	const jobRow = detailToJobRow(detail, {
		status: 'in_progress',
		started_at: new Date().toISOString()
	});
	await setCachedJobStarted(jobId, buildDriverJobStartedPageData(jobRow));
}
