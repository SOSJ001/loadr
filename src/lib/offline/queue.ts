import { deleteQueueItem, putQueueItem, readAllQueueItems } from '$lib/offline/db';
import type { OfflineQueueItem } from '$lib/offline/types';
import { setPendingSyncCount, setPendingSyncJobs } from '$lib/stores/offline.svelte';

function createId(): string {
	return crypto.randomUUID();
}

async function refreshPendingState(): Promise<void> {
	const items = await readAllQueueItems<OfflineQueueItem>();
	setPendingSyncCount(items.length);
	setPendingSyncJobs(items.map((item) => ({ jobId: item.jobId, type: item.type })));
}

export async function getPendingSyncCount(): Promise<number> {
	const items = await readAllQueueItems<OfflineQueueItem>();
	return items.length;
}

export async function queueStartJob(jobId: string): Promise<void> {
	const item: OfflineQueueItem = {
		id: createId(),
		type: 'start_job',
		jobId,
		createdAt: new Date().toISOString()
	};
	await putQueueItem(item);
	await refreshPendingState();
}

export async function queueCompleteJob(
	jobId: string,
	photo: File,
	recipientName?: string
): Promise<void> {
	const item: OfflineQueueItem = {
		id: createId(),
		type: 'complete_job',
		jobId,
		createdAt: new Date().toISOString(),
		recipientName: recipientName?.trim() || undefined,
		photo,
		photoName: photo.name || 'photo.jpg',
		photoType: photo.type || 'image/jpeg'
	};
	await putQueueItem(item);
	await refreshPendingState();
}

export async function queueReportIssue(
	jobId: string,
	fields: {
		reason: string;
		otherDescription?: string;
		notes?: string;
		photo?: File;
	}
): Promise<void> {
	const item: OfflineQueueItem = {
		id: createId(),
		type: 'report_issue',
		jobId,
		createdAt: new Date().toISOString(),
		reason: fields.reason,
		otherDescription: fields.otherDescription?.trim() || undefined,
		notes: fields.notes?.trim() || undefined,
		photo: fields.photo,
		photoName: fields.photo?.name || undefined,
		photoType: fields.photo?.type || undefined
	};
	await putQueueItem(item);
	await refreshPendingState();
}

export async function listQueuedActions(): Promise<OfflineQueueItem[]> {
	const items = await readAllQueueItems<OfflineQueueItem>();
	return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function removeQueuedAction(id: string): Promise<void> {
	await deleteQueueItem(id);
	await refreshPendingState();
}

export { refreshPendingState as refreshPendingCount };
