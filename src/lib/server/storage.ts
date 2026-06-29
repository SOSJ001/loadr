import { createAdminClient } from '$lib/server/supabase';

const BUCKET = 'job-uploads';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

function extensionForMime(mime: string): string {
	switch (mime) {
		case 'image/png':
			return 'png';
		case 'image/webp':
			return 'webp';
		case 'image/heic':
			return 'heic';
		default:
			return 'jpg';
	}
}

export type JobUploadCategory = 'issue' | 'pod';

export type UploadJobFileInput = {
	companyId: string;
	jobId: string;
	category: JobUploadCategory;
	file: File;
};

/** Upload a driver job artifact to Supabase Storage. Returns the storage object path. */
export async function uploadJobFile(input: UploadJobFileInput): Promise<string> {
	const { companyId, jobId, category, file } = input;

	if (!ALLOWED_MIME_TYPES.has(file.type)) {
		throw new Error('Photo must be JPEG, PNG, WebP, or HEIC');
	}

	const maxBytes = 10 * 1024 * 1024;
	if (file.size > maxBytes) {
		throw new Error('Photo must be 10 MB or smaller');
	}

	const ext = extensionForMime(file.type);
	const objectPath = `${companyId}/${jobId}/${category}/${crypto.randomUUID()}.${ext}`;

	const admin = createAdminClient();
	const body = new Uint8Array(await file.arrayBuffer());

	const { error } = await admin.storage.from(BUCKET).upload(objectPath, body, {
		contentType: file.type,
		upsert: false
	});

	if (error) throw error;

	return objectPath;
}

export function jobUploadStoragePath(path: string): string {
	return path;
}

export { BUCKET as JOB_UPLOADS_BUCKET };
