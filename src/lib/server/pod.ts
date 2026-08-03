import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { queueBlockchainWrite } from '$lib/server/blockchain';
import { JobsError, completeJobForDriver, getJobForUser } from '$lib/server/jobs';
import { notifyJobComplete } from '$lib/server/notifications';
import { createAdminClient } from '$lib/server/supabase';
import {
	createJobFileSignedUrl,
	downloadJobFile,
	uploadJobFile
} from '$lib/server/storage';
import type { Database } from '$lib/types/database';
import type { UserProfile } from '$lib/types/user';

type JobRow = Database['public']['Tables']['jobs']['Row'];
type AppSupabase = SupabaseClient<Database>;

export type PodType = 'photo' | 'signature';

export type UploadPodInput = {
	type: PodType;
	file: File;
	recipientName?: string | null;
	gpsLat?: number | null;
	gpsLng?: number | null;
	completedAt?: string;
};

export type UploadPodResult = {
	file_url: string;
	blockchain: { status: 'pending' };
	pod_id: string;
	job: JobRow;
};

export type PodForJob = {
	id: string;
	job_id: string;
	type: PodType;
	file_url: string;
	recipient_name: string | null;
	completed_at: string;
	gps_lat: number | null;
	gps_lng: number | null;
	blockchain_hash: string | null;
	blockchain_confirmed: boolean;
	blockchain_receipt: {
		status: string;
		solana_transaction_id: string | null;
	} | null;
};

function assertDriver(profile: UserProfile): void {
	if (profile.role !== 'driver') {
		throw new JobsError('Forbidden', 'FORBIDDEN', 403);
	}
}

function assertAdmin(profile: UserProfile): void {
	if (profile.role !== 'admin') {
		throw new JobsError('Forbidden', 'FORBIDDEN', 403);
	}
}

function sha256Hex(bytes: Uint8Array): string {
	return createHash('sha256').update(bytes).digest('hex');
}

function parseOptionalNumber(value: FormDataEntryValue | null): number | null {
	if (value == null || value === '') return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function parsePodType(value: FormDataEntryValue | null): PodType {
	const type = String(value ?? 'photo').trim();
	if (type === 'signature') return 'signature';
	return 'photo';
}

function fileFromFormData(formData: FormData): File {
	const photo = formData.get('photo');
	if (!(photo instanceof File) || photo.size === 0) {
		throw new JobsError('Delivery photo is required', 'VALIDATION_ERROR', 400);
	}
	return photo;
}

function formatReference(reference: string): string {
	return reference.startsWith('#') ? reference : `#${reference}`;
}

function pdfFilename(reference: string): string {
	const safe = reference.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^#/, '');
	return `loadr-pod-${safe || 'job'}.pdf`;
}

async function embedPodImage(pdfDoc: PDFDocument, bytes: Uint8Array, path: string) {
	if (path.endsWith('.png') || path.includes('.png')) {
		return pdfDoc.embedPng(bytes);
	}
	return pdfDoc.embedJpg(bytes);
}

/** Driver uploads proof of delivery and completes the job. */
export async function uploadPod(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string,
	input: UploadPodInput
): Promise<UploadPodResult> {
	assertDriver(profile);

	const existing = await getJobForUser(supabase, profile, jobId);
	if (!existing) {
		throw new JobsError('Job not found', 'NOT_FOUND', 404);
	}

	if (existing.status !== 'in_progress') {
		throw new JobsError(
			'Proof of delivery can only be submitted for in-progress jobs',
			'VALIDATION_ERROR',
			400
		);
	}

	const { data: existingPod } = await supabase
		.from('proof_of_delivery')
		.select('id')
		.eq('job_id', jobId)
		.maybeSingle();

	if (existingPod) {
		throw new JobsError('Proof of delivery already submitted for this job', 'VALIDATION_ERROR', 400);
	}

	const recipientName = input.recipientName?.trim() || null;
	if (input.type === 'signature' && !recipientName) {
		throw new JobsError('Recipient name is required for signature delivery', 'VALIDATION_ERROR', 400);
	}

	const completedAt = input.completedAt ?? new Date().toISOString();
	const fileBytes = new Uint8Array(await input.file.arrayBuffer());
	const hash = sha256Hex(fileBytes);

	let filePath: string;
	try {
		filePath = await uploadJobFile({
			companyId: existing.company_id,
			jobId: existing.id,
			category: 'pod',
			file: input.file
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Photo upload failed';
		throw new JobsError(message, 'VALIDATION_ERROR', 400);
	}

	const { data: podRow, error: podError } = await supabase
		.from('proof_of_delivery')
		.insert({
			job_id: existing.id,
			company_id: existing.company_id,
			driver_id: profile.id,
			type: input.type,
			file_url: filePath,
			recipient_name: recipientName,
			completed_at: completedAt,
			gps_lat: input.gpsLat ?? null,
			gps_lng: input.gpsLng ?? null,
			blockchain_confirmed: false,
			blockchain_hash: null
		})
		.select('id')
		.single();

	if (podError) throw podError;

	const job = await completeJobForDriver(supabase, profile, jobId, completedAt);
	if (!job) {
		throw new JobsError('Job not found', 'NOT_FOUND', 404);
	}

	await queueBlockchainWrite('proof_of_delivery', podRow.id, hash, existing.company_id);

	await notifyJobComplete(supabase, {
		companyId: job.company_id,
		jobId: job.id,
		reference: job.reference,
		driverName: profile.full_name
	});

	return {
		file_url: filePath,
		blockchain: { status: 'pending' },
		pod_id: podRow.id,
		job
	};
}

/** FormData adapter for API routes, page actions, and offline sync replay. */
export async function uploadPodForJob(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string,
	formData: FormData
): Promise<UploadPodResult> {
	return uploadPod(supabase, profile, jobId, {
		type: parsePodType(formData.get('type')),
		file: fileFromFormData(formData),
		recipientName: String(formData.get('recipient_name') ?? '').trim() || null,
		gpsLat: parseOptionalNumber(formData.get('gps_lat')),
		gpsLng: parseOptionalNumber(formData.get('gps_lng')),
		completedAt: String(formData.get('completed_at') ?? '').trim() || undefined
	});
}

async function loadBlockchainReceipt(referenceId: string) {
	const admin = createAdminClient();
	const { data, error } = await admin
		.from('blockchain_receipts')
		.select('status, solana_transaction_id')
		.eq('reference_type', 'proof_of_delivery')
		.eq('reference_id', referenceId)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error) throw error;
	return data;
}

/** Operator and assigned driver can read PoD metadata for a visible job. */
export async function getPodForJob(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string
): Promise<PodForJob | null> {
	const job = await getJobForUser(supabase, profile, jobId);
	if (!job) return null;

	const { data, error } = await supabase
		.from('proof_of_delivery')
		.select('*')
		.eq('job_id', jobId)
		.maybeSingle();

	if (error) throw error;
	if (!data) return null;

	const receipt = await loadBlockchainReceipt(data.id);

	return {
		id: data.id,
		job_id: data.job_id,
		type: data.type as PodType,
		file_url: data.file_url,
		recipient_name: data.recipient_name,
		completed_at: data.completed_at,
		gps_lat: data.gps_lat,
		gps_lng: data.gps_lng,
		blockchain_hash: data.blockchain_hash,
		blockchain_confirmed: data.blockchain_confirmed,
		blockchain_receipt: receipt
			? {
					status: receipt.status,
					solana_transaction_id: receipt.solana_transaction_id
				}
			: null
	};
}

/** Signed URL for inline PoD image display — authorized callers only. */
export async function getPodFileSignedUrl(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string
): Promise<string | null> {
	const pod = await getPodForJob(supabase, profile, jobId);
	if (!pod) return null;
	return createJobFileSignedUrl(pod.file_url);
}

/** Admin-only PDF export for a job's proof of delivery. */
export async function generatePodPdf(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string
): Promise<{ bytes: Uint8Array; filename: string }> {
	assertAdmin(profile);

	const job = await getJobForUser(supabase, profile, jobId);
	if (!job) {
		throw new JobsError('Job not found', 'NOT_FOUND', 404);
	}

	const { data: pod, error: podError } = await supabase
		.from('proof_of_delivery')
		.select('*')
		.eq('job_id', jobId)
		.maybeSingle();

	if (podError) throw podError;
	if (!pod) {
		throw new JobsError('Proof of delivery not found', 'NOT_FOUND', 404);
	}

	const { data: driver, error: driverError } = await supabase
		.from('users')
		.select('full_name')
		.eq('id', pod.driver_id)
		.maybeSingle();

	if (driverError) throw driverError;

	const imageBytes = await downloadJobFile(pod.file_url);
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([595, 842]);
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const margin = 48;
	let y = 800;

	const drawLine = (label: string, value: string, bold = false) => {
		page.drawText(label, {
			x: margin,
			y,
			size: 10,
			font: fontBold,
			color: rgb(0.35, 0.35, 0.35)
		});
		page.drawText(value, {
			x: margin,
			y: y - 14,
			size: 11,
			font: bold ? fontBold : font,
			color: rgb(0.1, 0.1, 0.1)
		});
		y -= 34;
	};

	page.drawText('Loadr Proof of Delivery', {
		x: margin,
		y,
		size: 18,
		font: fontBold,
		color: rgb(0.08, 0.2, 0.16)
	});
	y -= 36;

	drawLine('Job reference', formatReference(job.reference), true);
	drawLine('Pickup', job.pickup_address);
	drawLine('Drop-off', job.dropoff_address);
	drawLine('Completed at', new Date(pod.completed_at).toLocaleString('en-GB'));
	drawLine('Driver', driver?.full_name ?? 'Unknown');
	if (pod.recipient_name) {
		drawLine('Recipient', pod.recipient_name);
	}

	const blockchainLabel = pod.blockchain_confirmed
		? (pod.blockchain_hash ?? 'Confirmed')
		: 'Pending blockchain confirmation';
	drawLine('Blockchain hash', blockchainLabel);

	try {
		const image = await embedPodImage(pdfDoc, imageBytes, pod.file_url);
		const maxWidth = 499;
		const maxHeight = 280;
		const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
		const width = image.width * scale;
		const height = image.height * scale;

		y -= height + 16;
		page.drawImage(image, {
			x: margin,
			y,
			width,
			height
		});
	} catch (err) {
		console.error('[loadr] failed to embed PoD image in PDF:', err);
		y -= 20;
		page.drawText('PoD image could not be embedded.', {
			x: margin,
			y,
			size: 10,
			font,
			color: rgb(0.45, 0.1, 0.1)
		});
	}

	const bytes = await pdfDoc.save();
	return {
		bytes,
		filename: pdfFilename(job.reference)
	};
}

/** @deprecated Use generatePodPdf */
export async function downloadPodPdf(
	supabase: AppSupabase,
	profile: UserProfile,
	jobId: string
): Promise<ArrayBuffer> {
	const { bytes } = await generatePodPdf(supabase, profile, jobId);
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
