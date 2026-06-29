import type { PendingSyncJob } from '$lib/stores/offline.svelte';

export type SyncPreviewEntry = {
	jobId: string;
	type: PendingSyncJob['type'];
	showBadge?: boolean;
};

export function isDriverJobsPreviewMode(preview: string | null): boolean {
	return (
		preview === '4a' ||
		preview === '4b' ||
		preview === '4c' ||
		preview === '4d' ||
		preview === '4e' ||
		preview === '4f' ||
		preview === '10a' ||
		preview === '10b' ||
		preview === '10c' ||
		preview === '10d' ||
		preview === '10e' ||
		preview === '10f' ||
		preview === '4' ||
		preview === 'full-day' ||
		preview === 'empty' ||
		preview === 'light' ||
		preview === 'in-progress' ||
		preview === 'in_progress' ||
		preview === 'future-day' ||
		preview === 'future' ||
		preview === 'scrolled' ||
		preview === 'offline' ||
		preview === 'offline-light' ||
		preview === 'syncing' ||
		preview === 'banner-dismissing' ||
		preview === 'back-online' ||
		preview === 'back-online-syncing' ||
		preview === 'all-synced'
	);
}

export function isDriverJobsScrolledPreview(preview: string | null): boolean {
	return preview === '4f' || preview === 'scrolled';
}

export function isDriverJobsOfflineLightPreview(preview: string | null): boolean {
	return preview === '10f' || preview === 'offline-light';
}

export function isDriverJobsOfflinePreview(preview: string | null): boolean {
	return preview === '10a' || preview === 'offline' || isDriverJobsOfflineLightPreview(preview);
}

export function isDriverJobsDarkOfflinePreview(preview: string | null): boolean {
	return (
		preview === '10a' ||
		preview === 'offline' ||
		preview === '10b' ||
		preview === '10c' ||
		preview === 'syncing' ||
		preview === 'banner-dismissing'
	);
}

export function isDriverJobsBannerDismissPreview(preview: string | null): boolean {
	return preview === '10c' || preview === 'banner-dismissing';
}

export function isDriverJobsBackOnlineSyncPreview(preview: string | null): boolean {
	return preview === '10d' || preview === 'back-online' || preview === 'back-online-syncing';
}

export function isDriverJobsAllSyncedPreview(preview: string | null): boolean {
	return preview === '10e' || preview === 'all-synced';
}

export function isDriverJobsSyncPreview(preview: string | null): boolean {
	return preview === '10b' || preview === 'syncing';
}

export function syncPreviewPendingJobs(preview: string | null): SyncPreviewEntry[] {
	if (isDriverJobsBackOnlineSyncPreview(preview) || isDriverJobsAllSyncedPreview(preview)) {
		return [];
	}

	if (isDriverJobsOfflineLightPreview(preview)) {
		return [
			{ jobId: 'job-0042', type: 'start_job', showBadge: false },
			{ jobId: 'job-0044', type: 'complete_job', showBadge: true }
		];
	}

	if (
		isDriverJobsSyncPreview(preview) ||
		isDriverJobsOfflinePreview(preview) ||
		isDriverJobsBannerDismissPreview(preview)
	) {
		return [{ jobId: 'job-0044', type: 'complete_job', showBadge: true }];
	}

	return [];
}

export function syncPreviewJobIds(preview: string | null): string[] {
	return syncPreviewPendingJobs(preview).map((entry) => entry.jobId);
}

export function isDriverJobsLightPreview(preview: string | null): boolean {
	return preview === '4c' || preview === 'light' || isDriverJobsOfflineLightPreview(preview);
}
