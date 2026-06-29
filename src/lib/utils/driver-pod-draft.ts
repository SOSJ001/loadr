const DB_NAME = 'loadr-driver';
const STORE = 'pod-drafts';
const DB_VERSION = 1;

type PodDraftRecord = {
	blob: Blob;
	name: string;
	type: string;
};

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE);
			}
		};

		request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
		request.onsuccess = () => resolve(request.result);
	});
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
	});
}

export async function savePodDraft(jobId: string, file: File): Promise<void> {
	const db = await openDb();
	try {
		const record: PodDraftRecord = {
			blob: file,
			name: file.name || 'photo.jpg',
			type: file.type || 'image/jpeg'
		};
		await idbRequest(db.transaction(STORE, 'readwrite').objectStore(STORE).put(record, jobId));
	} finally {
		db.close();
	}
}

export async function loadPodDraft(jobId: string): Promise<File | null> {
	if (typeof indexedDB === 'undefined') return null;

	const db = await openDb();
	try {
		const record = await idbRequest<PodDraftRecord | undefined>(
			db.transaction(STORE, 'readonly').objectStore(STORE).get(jobId)
		);
		if (!record?.blob) return null;

		return new File([record.blob], record.name, {
			type: record.type || record.blob.type || 'image/jpeg'
		});
	} catch {
		return null;
	} finally {
		db.close();
	}
}

export async function clearPodDraft(jobId: string): Promise<void> {
	if (typeof indexedDB === 'undefined') return;

	const db = await openDb();
	try {
		await idbRequest(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(jobId));
	} catch {
		// Best-effort cleanup after successful submit.
	} finally {
		db.close();
	}
}

const recipientKey = (jobId: string) => `loadr:pod-recipient:${jobId}`;

export function savePodRecipientDraft(jobId: string, name: string): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.setItem(recipientKey(jobId), name);
}

export function loadPodRecipientDraft(jobId: string): string {
	if (typeof sessionStorage === 'undefined') return '';
	return sessionStorage.getItem(recipientKey(jobId)) ?? '';
}

export function clearPodRecipientDraft(jobId: string): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.removeItem(recipientKey(jobId));
}
