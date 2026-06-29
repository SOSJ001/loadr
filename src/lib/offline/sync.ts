import { listQueuedActions, removeQueuedAction } from '$lib/offline/queue';
import type { OfflineQueueItem } from '$lib/offline/types';
import { setSyncError, setSyncSuccess, setSyncing } from '$lib/stores/offline.svelte';
import { getPendingSyncCount } from '$lib/offline/queue';

let flushing = false;

async function parseApiError(response: Response): Promise<string> {
	try {
		const body = (await response.json()) as { error?: { message?: string }; message?: string };
		return body.error?.message ?? body.message ?? `Request failed (${response.status})`;
	} catch {
		return `Request failed (${response.status})`;
	}
}

async function replayItem(item: OfflineQueueItem): Promise<void> {
	switch (item.type) {
		case 'start_job': {
			const response = await fetch(`/api/v1/jobs/${item.jobId}`, {
				method: 'PATCH',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'in_progress' })
			});
			if (response.status === 401) throw response;
			if (!response.ok) throw new Error(await parseApiError(response));
			return;
		}
		case 'complete_job': {
			const formData = new FormData();
			formData.append(
				'photo',
				new File([item.photo], item.photoName, { type: item.photoType })
			);
			if (item.recipientName) {
				formData.append('recipient_name', item.recipientName);
			}
			const response = await fetch(`/api/v1/jobs/${item.jobId}/pod`, {
				method: 'POST',
				credentials: 'same-origin',
				body: formData
			});
			if (response.status === 401) throw response;
			if (!response.ok) throw new Error(await parseApiError(response));
			return;
		}
		case 'report_issue': {
			const formData = new FormData();
			formData.append('reason', item.reason);
			if (item.otherDescription) formData.append('other_description', item.otherDescription);
			if (item.notes) formData.append('notes', item.notes);
			if (item.photo) {
				formData.append(
					'photo',
					new File([item.photo], item.photoName ?? 'photo.jpg', {
						type: item.photoType ?? item.photo.type ?? 'image/jpeg'
					})
				);
			}
			const response = await fetch(`/api/v1/jobs/${item.jobId}/report-issue`, {
				method: 'POST',
				credentials: 'same-origin',
				body: formData
			});
			if (response.status === 401) throw response;
			if (!response.ok) throw new Error(await parseApiError(response));
		}
	}
}

export async function flushOfflineQueue(): Promise<void> {
	if (flushing || typeof navigator === 'undefined' || !navigator.onLine) return;

	flushing = true;
	setSyncError(null);
	setSyncing(true);

	try {
		const items = await listQueuedActions();
		const hadWork = items.length > 0;
		let syncFailed = false;

		for (const item of items) {
			try {
				await replayItem(item);
				await removeQueuedAction(item.id);
			} catch (error) {
				syncFailed = true;
				if (error instanceof Response && error.status === 401) {
					setSyncError('Please log in again to sync your updates.');
					break;
				}
				const message = error instanceof Error ? error.message : 'Sync failed';
				if (message.includes('(401)')) {
					setSyncError('Please log in again to sync your updates.');
				} else {
					setSyncError(message);
				}
				break;
			}
		}

		const remaining = await getPendingSyncCount();
		if (hadWork && remaining === 0 && !syncFailed) {
			setSyncSuccess(true);
		}
	} finally {
		flushing = false;
		setSyncing(false);
	}
}
