import { error } from '@sveltejs/kit';
import { isOffline } from '$lib/offline/init';
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
import type { DriverJobFlowContext } from '$lib/types/driver-job-flow';
import type { DriverJobDetailPageData } from '$lib/types/driver-job-detail';
import type { DriverJobStartedPageData } from '$lib/types/driver-job-started';
import type { DriverJobsPageData } from '$lib/types/driver-jobs';
import { DRIVER_ISSUE_REASONS } from '$lib/types/driver-job-flow';
import { toDateKey } from '$lib/utils/driver-jobs';

const OFFLINE_UNAVAILABLE =
	'This page is not available offline. Connect to load it, or open it while online first.';

async function fetchJson<T>(url: string): Promise<T> {
	const response = await fetch(url, { credentials: 'same-origin' });
	if (!response.ok) {
		throw error(response.status, response.status === 404 ? 'Not found' : 'Failed to load data');
	}
	return (await response.json()) as T;
}

export async function loadDriverJobsPage(date?: string): Promise<{
	pageData: DriverJobsPageData;
	fromCache: boolean;
}> {
	const selectedDate = date ?? toDateKey(new Date());

	if (isOffline()) {
		const cached = await getCachedJobsList(selectedDate);
		if (!cached) {
			error(503, OFFLINE_UNAVAILABLE);
		}
		return { pageData: cached, fromCache: true };
	}

	const { pageData } = await fetchJson<{ pageData: DriverJobsPageData }>(
		`/api/v1/jobs/driver-page?date=${encodeURIComponent(selectedDate)}`
	);
	await setCachedJobsList(selectedDate, pageData);
	return { pageData, fromCache: false };
}

export async function loadDriverJobDetail(jobId: string): Promise<{
	driverPageData: DriverJobDetailPageData;
	fromCache: boolean;
}> {
	if (isOffline()) {
		const cached = await getCachedJobDetail(jobId);
		if (!cached) {
			error(503, OFFLINE_UNAVAILABLE);
		}
		return { driverPageData: cached, fromCache: true };
	}

	const { driverPageData } = await fetchJson<{ driverPageData: DriverJobDetailPageData }>(
		`/api/v1/jobs/${jobId}/driver-detail`
	);
	await setCachedJobDetail(jobId, driverPageData);

	const flowContext: DriverJobFlowContext = {
		id: driverPageData.id,
		reference: driverPageData.reference,
		pickup_address: driverPageData.pickup_address,
		dropoff_address: driverPageData.dropoff_address
	};
	await setCachedJobFlow(jobId, flowContext);

	return { driverPageData, fromCache: false };
}

export async function loadDriverJobStarted(jobId: string): Promise<{
	pageData: DriverJobStartedPageData;
	fromCache: boolean;
}> {
	if (isOffline()) {
		const cached = await getCachedJobStarted(jobId);
		if (cached) {
			return { pageData: cached, fromCache: true };
		}
		// Fall back to optimistic cache from detail if started page not cached yet
		const detail = await getCachedJobDetail(jobId);
		if (detail && detail.status === 'in_progress') {
			const { ensureJobStartedCache } = await import('$lib/offline/optimistic');
			await ensureJobStartedCache(jobId);
			const started = await getCachedJobStarted(jobId);
			if (started) {
				return { pageData: started, fromCache: true };
			}
		}
		error(503, OFFLINE_UNAVAILABLE);
	}

	try {
		const { pageData } = await fetchJson<{ pageData: DriverJobStartedPageData }>(
			`/api/v1/jobs/${jobId}/driver-started`
		);
		await setCachedJobStarted(jobId, pageData);
		return { pageData, fromCache: false };
	} catch (err) {
		// Optimistic start: job may still be pending on server
		const cached = await getCachedJobStarted(jobId);
		if (cached) {
			return { pageData: cached, fromCache: true };
		}
		throw err;
	}
}

export async function loadDriverJobFlow(jobId: string): Promise<{
	job: DriverJobFlowContext;
	fromCache: boolean;
}> {
	if (isOffline()) {
		const cached = await getCachedJobFlow(jobId);
		if (cached) {
			return { job: cached, fromCache: true };
		}
		const detail = await getCachedJobDetail(jobId);
		if (detail) {
			const job: DriverJobFlowContext = {
				id: detail.id,
				reference: detail.reference,
				pickup_address: detail.pickup_address,
				dropoff_address: detail.dropoff_address
			};
			await setCachedJobFlow(jobId, job);
			return { job, fromCache: true };
		}
		error(503, OFFLINE_UNAVAILABLE);
	}

	const { job } = await fetchJson<{ job: DriverJobFlowContext }>(
		`/api/v1/jobs/${jobId}/driver-flow`
	);
	await setCachedJobFlow(jobId, job);
	return { job, fromCache: false };
}

export async function loadDriverReportIssueSuccess(jobId: string): Promise<{
	job: DriverJobFlowContext;
	fromCache: boolean;
}> {
	return loadDriverJobFlow(jobId);
}

export const driverReportIssueReasons = DRIVER_ISSUE_REASONS;

/** Prefetch job details for visible list jobs (best-effort, online only). */
export async function prefetchJobDetailsForList(pageData: DriverJobsPageData): Promise<void> {
	if (isOffline()) return;

	const jobs = [...pageData.morning_jobs, ...pageData.afternoon_jobs];
	await Promise.allSettled(
		jobs.map(async (job) => {
			const existing = await getCachedJobDetail(job.id);
			if (existing) return;
			await loadDriverJobDetail(job.id);
		})
	);
}
