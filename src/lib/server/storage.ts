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

function objectPath(input: UploadJobFileInput): string {
	const ext = extensionForMime(input.file.type);
	const filename = `${crypto.randomUUID()}.${ext}`;

	if (input.category === 'pod') {
		return `pod/${input.companyId}/${input.jobId}/${filename}`;
	}

	return `${input.companyId}/${input.jobId}/${input.category}/${filename}`;
}

/** Upload a driver job artifact to Supabase Storage. Returns the storage object path. */
export async function uploadJobFile(input: UploadJobFileInput): Promise<string> {
	const { file } = input;

	if (!ALLOWED_MIME_TYPES.has(file.type)) {
		throw new Error('Photo must be JPEG, PNG, WebP, or HEIC');
	}

	const maxBytes = 10 * 1024 * 1024;
	if (file.size > maxBytes) {
		throw new Error('Photo must be 10 MB or smaller');
	}

	const path = objectPath(input);
	const admin = createAdminClient();
	const body = new Uint8Array(await file.arrayBuffer());

	const { error } = await admin.storage.from(BUCKET).upload(path, body, {
		contentType: file.type,
		upsert: false
	});

	if (error) throw error;

	return path;
}

/** Download a private job-uploads object by storage path. */
export async function downloadJobFile(path: string): Promise<Uint8Array> {
	const admin = createAdminClient();
	const { data, error } = await admin.storage.from(BUCKET).download(path);

	if (error) throw error;
	if (!data) throw new Error('File not found');

	return new Uint8Array(await data.arrayBuffer());
}

/** Short-lived signed URL for authorized clients — never expose raw storage paths as public URLs. */
export async function createJobFileSignedUrl(
	path: string,
	ttlSeconds = 3600
): Promise<string> {
	const admin = createAdminClient();
	const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, ttlSeconds);

	if (error) throw error;
	if (!data?.signedUrl) throw new Error('Failed to create signed URL');

	return data.signedUrl;
}

export function jobUploadStoragePath(path: string): string {
	return path;
}

export { BUCKET as JOB_UPLOADS_BUCKET };
