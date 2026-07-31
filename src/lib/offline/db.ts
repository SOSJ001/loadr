const DB_NAME = 'loadr-offline';
const QUEUE_STORE = 'action-queue';
const PAGE_CACHE_STORE = 'page-cache';
const DB_VERSION = 2;

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(QUEUE_STORE)) {
				db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
			}
			if (!db.objectStoreNames.contains(PAGE_CACHE_STORE)) {
				db.createObjectStore(PAGE_CACHE_STORE);
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

export async function readAllQueueItems<T>(): Promise<T[]> {
	if (typeof indexedDB === 'undefined') return [];

	const db = await openDb();
	try {
		return await idbRequest<T[]>(
			db.transaction(QUEUE_STORE, 'readonly').objectStore(QUEUE_STORE).getAll()
		);
	} finally {
		db.close();
	}
}

export async function putQueueItem<T extends { id: string }>(item: T): Promise<void> {
	const db = await openDb();
	try {
		await idbRequest(
			db.transaction(QUEUE_STORE, 'readwrite').objectStore(QUEUE_STORE).put(item)
		);
	} finally {
		db.close();
	}
}

export async function deleteQueueItem(id: string): Promise<void> {
	const db = await openDb();
	try {
		await idbRequest(
			db.transaction(QUEUE_STORE, 'readwrite').objectStore(QUEUE_STORE).delete(id)
		);
	} finally {
		db.close();
	}
}

export async function getPageCacheItem<T>(key: string): Promise<T | null> {
	if (typeof indexedDB === 'undefined') return null;

	const db = await openDb();
	try {
		const value = await idbRequest<T | undefined>(
			db.transaction(PAGE_CACHE_STORE, 'readonly').objectStore(PAGE_CACHE_STORE).get(key)
		);
		return value ?? null;
	} catch {
		return null;
	} finally {
		db.close();
	}
}

export async function setPageCacheItem<T>(key: string, value: T): Promise<void> {
	if (typeof indexedDB === 'undefined') return;

	const db = await openDb();
	try {
		await idbRequest(
			db.transaction(PAGE_CACHE_STORE, 'readwrite').objectStore(PAGE_CACHE_STORE).put(value, key)
		);
	} finally {
		db.close();
	}
}

export async function deletePageCacheItem(key: string): Promise<void> {
	if (typeof indexedDB === 'undefined') return;

	const db = await openDb();
	try {
		await idbRequest(
			db.transaction(PAGE_CACHE_STORE, 'readwrite').objectStore(PAGE_CACHE_STORE).delete(key)
		);
	} finally {
		db.close();
	}
}

export const pageCacheKeys = {
	jobsList: (date: string) => `jobs-list:${date}`,
	jobDetail: (jobId: string) => `job-detail:${jobId}`,
	jobFlow: (jobId: string) => `job-flow:${jobId}`,
	jobStarted: (jobId: string) => `job-started:${jobId}`
} as const;
