import { getPageCacheItem, pageCacheKeys, setPageCacheItem } from '$lib/offline/db';
import type { DriverJobFlowContext } from '$lib/types/driver-job-flow';
import type { DriverJobDetailPageData } from '$lib/types/driver-job-detail';
import type { DriverJobStartedPageData } from '$lib/types/driver-job-started';
import type { DriverJobsPageData } from '$lib/types/driver-jobs';

export async function getCachedJobsList(date: string): Promise<DriverJobsPageData | null> {
	return getPageCacheItem<DriverJobsPageData>(pageCacheKeys.jobsList(date));
}

export async function setCachedJobsList(date: string, data: DriverJobsPageData): Promise<void> {
	await setPageCacheItem(pageCacheKeys.jobsList(date), data);
}

export async function getCachedJobDetail(jobId: string): Promise<DriverJobDetailPageData | null> {
	return getPageCacheItem<DriverJobDetailPageData>(pageCacheKeys.jobDetail(jobId));
}

export async function setCachedJobDetail(
	jobId: string,
	data: DriverJobDetailPageData
): Promise<void> {
	await setPageCacheItem(pageCacheKeys.jobDetail(jobId), data);
}

export async function getCachedJobFlow(jobId: string): Promise<DriverJobFlowContext | null> {
	return getPageCacheItem<DriverJobFlowContext>(pageCacheKeys.jobFlow(jobId));
}

export async function setCachedJobFlow(jobId: string, data: DriverJobFlowContext): Promise<void> {
	await setPageCacheItem(pageCacheKeys.jobFlow(jobId), data);
}

export async function getCachedJobStarted(
	jobId: string
): Promise<DriverJobStartedPageData | null> {
	return getPageCacheItem<DriverJobStartedPageData>(pageCacheKeys.jobStarted(jobId));
}

export async function setCachedJobStarted(
	jobId: string,
	data: DriverJobStartedPageData
): Promise<void> {
	await setPageCacheItem(pageCacheKeys.jobStarted(jobId), data);
}

/** Latest cached jobs list (any date) for error recovery. */
export async function getAnyCachedJobsList(): Promise<DriverJobsPageData | null> {
	if (typeof indexedDB === 'undefined') return null;

	const today = new Date();
	for (let offset = 0; offset < 14; offset += 1) {
		const date = new Date(today);
		date.setDate(today.getDate() - offset);
		const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
		const cached = await getCachedJobsList(key);
		if (cached) return cached;
	}
	return null;
}
