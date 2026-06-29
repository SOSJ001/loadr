<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import {
		AlertCircle,
		Bell,
		Camera,
		Check,
		ClipboardList,
		CircleEllipsis,
		MapPinOff,
		PackageX,
		UserX,
		X
	} from '@lucide/svelte';
	import DriverJobSubpageTopNav from '$lib/components/driver/DriverJobSubpageTopNav.svelte';
	import { isOffline } from '$lib/offline/init';
	import { queueReportIssue } from '$lib/offline/queue';
	import type { DriverJobFlowContext } from '$lib/types/driver-job-flow';
	import {
		DRIVER_ISSUE_REASON_OPTIONS,
		REPORT_ISSUE_NOTES_MAX_LENGTH,
		REPORT_ISSUE_OTHER_DESCRIPTION_MAX_LENGTH,
		type DriverIssueReasonOption
	} from '$lib/types/driver-report-issue';
	import { reportIssueJobRefLabel } from '$lib/utils/driver-report-issue-theme';

	type Props = {
		job: DriverJobFlowContext;
		preview?: boolean;
		initialSelectedReason?: string;
		initialNotes?: string;
		initialPhotoAttached?: boolean;
		formError?: string | null;
	};

	let {
		job,
		preview = false,
		initialSelectedReason = '',
		initialNotes = '',
		initialPhotoAttached = false,
		formError = null
	}: Props = $props();

	const reasonOptions: DriverIssueReasonOption[] = DRIVER_ISSUE_REASON_OPTIONS;
	const jobRefLabel = $derived(reportIssueJobRefLabel(job.dropoff_address));

	let submitting = $state(false);
	let selectedReason = $state(initialSelectedReason);
	let otherDescription = $state('');
	let notes = $state(initialNotes);
	let photoPreview = $state<string | null>(null);
	let photoAttachedPreview = $state(initialPhotoAttached);
	let photoInput = $state<HTMLInputElement | null>(null);
	let pendingPhotoFile = $state<File | null>(null);

	const hasPhoto = $derived(Boolean(photoPreview) || photoAttachedPreview);
	const canSubmit = $derived(Boolean(selectedReason) && !submitting && !preview);
	const notesCount = $derived(notes.length);

	const reasonIcons = {
		'No answer': UserX,
		'Address not found': MapPinOff,
		'Refused delivery': PackageX,
		Other: CircleEllipsis
	} as const;

	function onPhotoSelected(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) {
			clearPhoto();
			return;
		}

		photoAttachedPreview = false;
		if (photoPreview) URL.revokeObjectURL(photoPreview);
		photoPreview = URL.createObjectURL(file);
		pendingPhotoFile = file;
	}

	function clearPhoto() {
		photoPreview = null;
		photoAttachedPreview = false;
		pendingPhotoFile = null;
		if (photoInput) photoInput.value = '';
	}

	function onNotesInput(event: Event) {
		const value = (event.currentTarget as HTMLTextAreaElement).value;
		notes = value.slice(0, REPORT_ISSUE_NOTES_MAX_LENGTH);
	}

	function onOtherDescriptionInput(event: Event) {
		const value = (event.currentTarget as HTMLTextAreaElement).value;
		otherDescription = value.slice(0, REPORT_ISSUE_OTHER_DESCRIPTION_MAX_LENGTH);
	}
</script>

<div class="flex min-h-full flex-1 flex-col bg-white dark:bg-slate-900">
	<DriverJobSubpageTopNav title="Report Issue" backHref="/jobs/{job.id}" />

	<form
		method="POST"
		enctype="multipart/form-data"
		class="flex min-h-0 flex-1 flex-col"
		use:enhance={({ formData, cancel }) => {
			if (isOffline()) {
				cancel();
				submitting = true;
				const photo = pendingPhotoFile ?? (formData.get('photo') as File | null);
				void queueReportIssue(job.id, {
					reason: selectedReason,
					otherDescription: otherDescription || undefined,
					notes: notes || undefined,
					photo: photo ?? undefined
				})
					.then(() => goto(`/jobs/${job.id}/report-issue/success?offline=1`))
					.finally(() => {
						submitting = false;
					});
				return;
			}

			submitting = true;
			return async ({ update }) => {
				submitting = false;
				await update();
			};
		}}
	>
		<div class="px-5 pt-2">
			<div
				class="flex h-11 items-center gap-2 rounded-[10px] bg-gray-100 px-4 dark:bg-slate-800"
			>
				<ClipboardList
					size={16}
					class="shrink-0 text-slate-400"
					stroke-width={1.75}
					aria-hidden="true"
				/>
				<p class="font-inter min-w-0 truncate text-[13px] text-gray-500 dark:text-slate-400">
					<span class="font-['DM_Mono',ui-monospace,monospace] font-medium text-gray-500 dark:text-slate-400">
						Job {job.reference}
					</span>
					<span aria-hidden="true"> · </span>
					<span>{jobRefLabel}</span>
				</p>
			</div>
		</div>

		<div class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-4 pb-52">
			<section class="flex flex-col gap-3.5">
				<h2 class="font-syne text-base font-bold text-gray-900 dark:text-slate-100">
					What happened?
				</h2>
				<div class="flex flex-col gap-2.5">
					{#each reasonOptions as option (option.value)}
						{@const ReasonIcon = reasonIcons[option.value as keyof typeof reasonIcons]}
						<label
							class="flex cursor-pointer flex-col gap-2.5 rounded-[14px] border-[1.5px] p-4 transition-colors {selectedReason ===
							option.value
								? 'border-brand bg-green-50 dark:border-brand dark:bg-[#052e16]'
								: 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800'}"
						>
							<div class="flex items-center justify-between gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-3.5">
									<div class="relative flex size-[22px] shrink-0 items-center justify-center">
										<input
											type="radio"
											name="reason"
											value={option.value}
											bind:group={selectedReason}
											class="peer sr-only"
											required
										/>
										<span
											class="pointer-events-none flex size-[22px] items-center justify-center rounded-full border-2 transition-colors {selectedReason ===
											option.value
												? 'border-brand bg-brand'
												: 'border-gray-300 bg-transparent dark:border-slate-500'}"
											aria-hidden="true"
										>
											{#if selectedReason === option.value}
												<span class="size-2 rounded-full bg-white"></span>
											{/if}
										</span>
									</div>
									<div class="min-w-0">
										<p class="font-syne text-sm font-bold text-gray-900 dark:text-slate-100">
											{option.label}
										</p>
										<p class="font-inter text-xs text-gray-500 dark:text-slate-400">
											{option.description}
										</p>
									</div>
								</div>
								<ReasonIcon
									size={20}
									class="shrink-0 text-slate-400 dark:text-slate-500"
									stroke-width={1.75}
									aria-hidden="true"
								/>
							</div>
							{#if option.value === 'Other' && selectedReason === 'Other'}
								<div class="flex w-full flex-col gap-1.5">
									<p class="font-inter text-xs font-medium text-slate-400">
										Please describe what happened
									</p>
									<textarea
										name="other_description"
										rows="3"
										value={otherDescription}
										oninput={onOtherDescriptionInput}
										placeholder="e.g. vehicle breakdown, access issue, wrong postcode..."
										class="font-inter min-h-20 w-full resize-none rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 text-sm leading-normal text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
									></textarea>
								</div>
							{/if}
						</label>
					{/each}
				</div>
			</section>

			<section class="flex flex-col gap-2.5">
				<div class="flex items-center justify-between gap-3">
					<h3 class="font-inter text-sm font-semibold text-gray-900 dark:text-slate-100">
						Additional notes
					</h3>
					<span
						class="font-inter rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 dark:bg-slate-800 dark:text-slate-400"
					>
						Optional
					</span>
				</div>
				<div class="relative">
					<textarea
						id="notes"
						name="notes"
						rows="4"
						value={notes}
						oninput={onNotesInput}
						placeholder="Add any extra details — this helps your operator resolve the issue faster"
						class="font-inter min-h-24 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-normal text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
					></textarea>
					<p
						class="font-inter pointer-events-none absolute right-4 bottom-3 text-[11px] text-slate-400"
						aria-live="polite"
					>
						{notesCount} / {REPORT_ISSUE_NOTES_MAX_LENGTH}
					</p>
				</div>
			</section>

			<section class="flex flex-col gap-2.5">
				<div class="flex items-center justify-between gap-3">
					<h3 class="font-inter text-sm font-semibold text-gray-900 dark:text-slate-100">
						Attach a photo
					</h3>
					<span
						class="font-inter rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 dark:bg-slate-800 dark:text-slate-400"
					>
						Optional
					</span>
				</div>
				<p class="font-inter text-xs text-gray-500 dark:text-slate-400">
					A photo helps your operator understand what happened
				</p>
				{#if hasPhoto}
					<div
						class="relative h-[120px] overflow-hidden rounded-[14px] border-[1.5px] border-green-600 bg-gray-700 dark:bg-gray-700"
					>
						{#if photoPreview}
							<img
								src={photoPreview}
								alt=""
								class="absolute inset-0 h-full w-full object-cover"
							/>
						{/if}
						<input
							bind:this={photoInput}
							type="file"
							name="photo"
							accept="image/jpeg,image/png,image/webp,image/heic"
							capture="environment"
							class="sr-only"
							onchange={onPhotoSelected}
						/>
						<button
							type="button"
							class="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
							aria-label="Remove photo"
							onclick={clearPhoto}
						>
							<X size={14} stroke-width={2} aria-hidden="true" />
						</button>
						<div
							class="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-green-600/90 px-2.5 py-1"
						>
							<Check size={12} class="text-white" stroke-width={2.5} aria-hidden="true" />
							<span class="font-inter text-[11px] font-semibold text-white">Photo attached</span>
						</div>
					</div>
				{:else}
					<label
						class="flex min-h-[52px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700/40"
					>
						<input
							bind:this={photoInput}
							type="file"
							name="photo"
							accept="image/jpeg,image/png,image/webp,image/heic"
							capture="environment"
							class="sr-only"
							onchange={onPhotoSelected}
						/>
						<Camera size={28} class="text-gray-500 dark:text-slate-400" stroke-width={1.75} aria-hidden="true" />
						<p class="font-inter text-[13px] font-medium text-gray-500 dark:text-slate-400">Tap to take a photo</p>
					</label>
				{/if}
			</section>

			{#if formError}
				<p class="font-inter text-center text-sm text-red-600 dark:text-red-400">{formError}</p>
			{/if}
		</div>

		<div
			class="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-5 pt-4 pb-[34px] dark:border-slate-700 dark:bg-slate-900"
		>
			<div class="mx-auto flex w-full max-w-[390px] flex-col gap-2">
				<div class="flex items-center justify-center gap-1.5 pb-1">
					<Bell size={14} class="text-slate-400" stroke-width={1.75} aria-hidden="true" />
					<p class="font-inter text-xs text-gray-500 dark:text-slate-400">Your operator will be notified immediately</p>
				</div>
				<button
					type="submit"
					class="font-syne flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] text-[15px] font-bold transition-opacity {canSubmit
						? 'bg-[#d97706] text-white hover:opacity-90'
						: 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-slate-600 dark:text-gray-400'}"
					disabled={!canSubmit}
				>
					<AlertCircle size={18} stroke-width={2} aria-hidden="true" />
					{submitting ? 'Submitting…' : 'Submit report'}
				</button>
				<a
					href="/jobs/{job.id}"
					class="font-syne flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-gray-200 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
				>
					<X size={16} stroke-width={2} aria-hidden="true" />
					Cancel
				</a>
			</div>
		</div>
	</form>
</div>
