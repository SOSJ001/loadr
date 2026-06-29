<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Camera, CircleCheck, MapPin } from '@lucide/svelte';
	import DriverJobSubpageTopNav from '$lib/components/driver/DriverJobSubpageTopNav.svelte';
	import { isOffline } from '$lib/offline/init';
	import { queueCompleteJob } from '$lib/offline/queue';
	import type { DriverJobFlowContext } from '$lib/types/driver-job-flow';
	import {
		clearPodDraft,
		clearPodRecipientDraft,
		loadPodDraft,
		loadPodRecipientDraft,
		savePodDraft,
		savePodRecipientDraft
	} from '$lib/utils/driver-pod-draft';

	type Props = {
		job: DriverJobFlowContext;
		formError?: string | null;
	};

	let { job, formError = null }: Props = $props();

	let submitting = $state(false);
	let photoPreview = $state<string | null>(null);
	let photoName = $state<string | null>(null);
	let hasPhoto = $state(false);
	let pendingPhotoFile = $state<File | null>(null);
	let photoInput = $state<HTMLInputElement | null>(null);
	let recipientName = $state('');
	let draftReady = $state(false);

	function revokePreview() {
		if (photoPreview?.startsWith('blob:')) {
			URL.revokeObjectURL(photoPreview);
		}
	}

	function setPhoto(file: File) {
		revokePreview();
		pendingPhotoFile = file;
		photoName = file.name || 'photo.jpg';
		hasPhoto = true;
		photoPreview = URL.createObjectURL(file);
	}

	function clearPhoto() {
		revokePreview();
		photoPreview = null;
		photoName = null;
		hasPhoto = false;
		pendingPhotoFile = null;
		if (photoInput) photoInput.value = '';
		void clearPodDraft(job.id);
	}

	async function persistPhoto(file: File) {
		try {
			await savePodDraft(job.id, file);
		} catch {
			// Preview still works for this session even if persistence fails.
		}
	}

	async function onPhotoSelected(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || file.size === 0) {
			if (hasPhoto) return;
			clearPhoto();
			return;
		}

		setPhoto(file);
		await persistPhoto(file);
	}

	function onRecipientInput(event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value;
		recipientName = value;
		savePodRecipientDraft(job.id, value);
	}

	onMount(() => {
		recipientName = loadPodRecipientDraft(job.id);

		void (async () => {
			const draft = await loadPodDraft(job.id);
			if (draft) {
				setPhoto(draft);
			}
			draftReady = true;
		})();

		return () => revokePreview();
	});
</script>

<div class="flex min-h-full flex-1 flex-col bg-white dark:bg-slate-900">
	<DriverJobSubpageTopNav title="Complete delivery" backHref="/jobs/{job.id}" />

	<form
		method="POST"
		enctype="multipart/form-data"
		class="flex min-h-0 flex-1 flex-col"
		use:enhance={({ formData, cancel }) => {
			if (!pendingPhotoFile && !(formData.get('photo') instanceof File)) {
				cancel();
				return;
			}

			if (isOffline()) {
				cancel();
				const photo = pendingPhotoFile ?? (formData.get('photo') as File);
				submitting = true;
				void queueCompleteJob(job.id, photo, recipientName)
					.then(async () => {
						clearPhoto();
						clearPodRecipientDraft(job.id);
						await goto(`/jobs/${job.id}?offline=1`);
					})
					.finally(() => {
						submitting = false;
					});
				return;
			}

			submitting = true;
			if (pendingPhotoFile) {
				formData.set('photo', pendingPhotoFile, pendingPhotoFile.name || 'photo.jpg');
			}

			return async ({ result, update }) => {
				submitting = false;

				if (result.type === 'redirect') {
					clearPhoto();
					clearPodRecipientDraft(job.id);
				}

				await update({ reset: false });
			};
		}}
	>
		<div class="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pt-5 pb-40">
			<section
				class="flex w-full flex-col gap-3 rounded-[14px] border border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-slate-800"
			>
				<p
					class="font-inter text-xs font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-slate-400"
				>
					Delivering to
				</p>
				<div class="flex gap-3">
					<div
						class="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950"
						aria-hidden="true"
					>
						<MapPin size={14} class="text-red-600 dark:text-red-500" stroke-width={2} />
					</div>
					<p class="font-inter text-[15px] font-semibold text-gray-900 dark:text-slate-100">
						{job.dropoff_address}
					</p>
				</div>
				<p class="font-inter text-sm text-gray-500 dark:text-slate-400">
					Job {job.reference} · take a photo as proof of delivery
				</p>
			</section>

			<div
				class="relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[14px] border-2 border-dashed border-gray-200 bg-gray-50 p-6 transition-colors hover:border-brand/40 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/40"
			>
				<input
					bind:this={photoInput}
					type="file"
					name="photo"
					accept="image/jpeg,image/png,image/webp,image/heic,image/*"
					capture="environment"
					class="absolute inset-0 z-10 cursor-pointer opacity-0"
					required={draftReady && !hasPhoto}
					onchange={onPhotoSelected}
				/>
				{#if photoPreview}
					<img
						src={photoPreview}
						alt="Delivery photo preview"
						class="pointer-events-none max-h-40 w-full rounded-lg object-cover"
					/>
					<p class="font-inter pointer-events-none text-center text-xs text-gray-500 dark:text-slate-400">
						{photoName} · tap to change
					</p>
				{:else}
					<div
						class="pointer-events-none flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950"
						aria-hidden="true"
					>
						<Camera size={24} class="text-brand" stroke-width={1.75} />
					</div>
					<div class="pointer-events-none text-center">
						<p class="font-syne text-[15px] font-bold text-gray-900 dark:text-slate-100">
							Add delivery photo
						</p>
						<p class="font-inter mt-1 text-sm text-gray-500 dark:text-slate-400">
							Take or choose a photo of the delivered goods
						</p>
					</div>
				{/if}
			</div>

			<div class="flex flex-col gap-2">
				<label
					for="recipient_name"
					class="font-inter text-xs font-medium text-gray-500 dark:text-slate-400"
				>
					Recipient name (optional)
				</label>
				<input
					id="recipient_name"
					name="recipient_name"
					type="text"
					autocomplete="name"
					placeholder="Who received the delivery?"
					value={recipientName}
					oninput={onRecipientInput}
					class="font-inter h-[52px] w-full rounded-[10px] border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
				/>
			</div>

			{#if formError}
				<p class="font-inter text-center text-sm text-red-600 dark:text-red-400">{formError}</p>
			{/if}
		</div>

		<div
			class="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-5 pt-4 pb-[34px] dark:border-slate-700 dark:bg-slate-900"
		>
			<button
				type="submit"
				class="font-syne mx-auto flex h-[52px] w-full max-w-[390px] items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
				disabled={submitting || !hasPhoto}
			>
				<CircleCheck size={18} stroke-width={2} aria-hidden="true" />
				{submitting ? 'Uploading…' : 'Submit proof of delivery'}
			</button>
		</div>
	</form>
</div>
