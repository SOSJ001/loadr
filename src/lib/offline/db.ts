const DB_NAME = 'loadr-offline';
const STORE = 'action-queue';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE, { keyPath: 'id' });
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
		return await idbRequest<T[]>(db.transaction(STORE, 'readonly').objectStore(STORE).getAll());
	} finally {
		db.close();
	}
}

export async function putQueueItem<T extends { id: string }>(item: T): Promise<void> {
	const db = await openDb();
	try {
		await idbRequest(db.transaction(STORE, 'readwrite').objectStore(STORE).put(item));
	} finally {
		db.close();
	}
}

export async function deleteQueueItem(id: string): Promise<void> {
	const db = await openDb();
	try {
		await idbRequest(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id));
	} finally {
		db.close();
	}
}
