export type PendingSyncJob = {
	jobId: string;
	type: 'start_job' | 'complete_job' | 'report_issue';
};

export const offlineState = $state({
	online: true,
	pendingSyncCount: 0,
	pendingSyncJobs: [] as PendingSyncJob[],
	syncing: false,
	syncSuccess: false,
	syncError: null as string | null
});

export function setOnlineStatus(online: boolean) {
	offlineState.online = online;
	if (!online) {
		offlineState.syncSuccess = false;
	}
	if (online) {
		offlineState.syncError = null;
	}
}

export function setPendingSyncCount(count: number) {
	offlineState.pendingSyncCount = count;
}

export function setPendingSyncJobs(jobs: PendingSyncJob[]) {
	offlineState.pendingSyncJobs = jobs;
}

export function setSyncError(message: string | null) {
	offlineState.syncError = message;
}

export function setSyncing(syncing: boolean) {
	offlineState.syncing = syncing;
}

export function setSyncSuccess(success: boolean) {
	offlineState.syncSuccess = success;
}
