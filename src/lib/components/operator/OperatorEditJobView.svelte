<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import CreateJobAddressField from '$lib/components/operator/CreateJobAddressField.svelte';
	import CreateJobDatePicker from '$lib/components/operator/CreateJobDatePicker.svelte';
	import CreateJobDiscardModal from '$lib/components/operator/CreateJobDiscardModal.svelte';
	import CreateJobErrorBanner from '$lib/components/operator/CreateJobErrorBanner.svelte';
	import CreateJobPreviewCard from '$lib/components/operator/CreateJobPreviewCard.svelte';
	import CreateJobRouteConnector from '$lib/components/operator/CreateJobRouteConnector.svelte';
	import CreateJobTimePicker from '$lib/components/operator/CreateJobTimePicker.svelte';
	import CreateJobTipsCard from '$lib/components/operator/CreateJobTipsCard.svelte';
	import OperatorEditJobHeader from '$lib/components/operator/OperatorEditJobHeader.svelte';
	import OperatorPageContent from '$lib/components/operator/OperatorPageContent.svelte';
	import {
		createJobCancelLinkClass,
		createJobDeleteButtonClass,
		createJobFieldErrorMessageClass,
		createJobFieldInputClass,
		createJobFieldInputErrorClass,
		createJobFieldLabelClass,
		createJobFieldLockedClass,
		createJobFormActionsClass,
		createJobFormCardClass,
		createJobFormRightActionsClass,
		createJobOptionalBadgeClass,
		createJobSectionLabelClass,
		createJobTextareaClass
	} from '$lib/components/operator/create-job-ui';
	import Button from '$lib/components/ui/Button.svelte';
	import {
		combineScheduledAt,
		hasCreateJobFieldErrors,
		type CreateJobDriverOption,
		type CreateJobFormSeed,
		validateCreateJobForm
	} from '$lib/utils/operator-create-job';
	import {
		editFormValuesFromSeed,
		hasEditJobUnsavedChanges
	} from '$lib/utils/operator-edit-job';
	import { Calendar, ChevronDown, FileText, Lock, Package, Users } from '@lucide/svelte';

	type Props = {
		jobId: string;
		reference: string;
		drivers: CreateJobDriverOption[];
		deletable?: boolean;
		errorMessage?: string | null;
		seed: CreateJobFormSeed;
	};

	let {
		jobId,
		reference,
		drivers,
		deletable = true,
		errorMessage = null,
		seed
	}: Props = $props();

	const initialValues = $derived(editFormValuesFromSeed(seed));

	let pickupAddress = $state('');
	let dropoffAddress = $state('');
	let pickupLat = $state<number | null>(null);
	let pickupLng = $state<number | null>(null);
	let dropoffLat = $state<number | null>(null);
	let dropoffLng = $state<number | null>(null);
	let scheduleDate = $state('');
	let scheduleTime = $state('');
	let driverId = $state('');
	let notes = $state('');
	let submitting = $state(false);
	let deleting = $state(false);
	let attempted = $state(false);
	let discardModalOpen = $state(false);

	$effect.pre(() => {
		pickupAddress = seed.pickupAddress ?? '';
		dropoffAddress = seed.dropoffAddress ?? '';
		pickupLat = seed.pickupLat ?? null;
		pickupLng = seed.pickupLng ?? null;
		dropoffLat = seed.dropoffLat ?? null;
		dropoffLng = seed.dropoffLng ?? null;
		scheduleDate = seed.scheduleDate ?? '';
		scheduleTime = seed.scheduleTime ?? '';
		driverId = seed.driverId ?? '';
		notes = seed.notes ?? '';
	});

	const notesCount = $derived(notes.length);

	const formValues = $derived({
		pickupAddress,
		pickupLat,
		pickupLng,
		dropoffAddress,
		dropoffLat,
		dropoffLng,
		scheduleDate,
		scheduleTime,
		driverId
	});

	const fieldErrors = $derived(attempted ? validateCreateJobForm(formValues) : {});

	const showErrorBanner = $derived(attempted && hasCreateJobFieldErrors(fieldErrors));

	const canSubmit = $derived(!hasCreateJobFieldErrors(validateCreateJobForm(formValues)));

	const hasUnsavedChanges = $derived(
		hasEditJobUnsavedChanges(
			{
				...formValues,
				notes
			},
			initialValues
		)
	);

	const scheduledAt = $derived(
		scheduleDate && scheduleTime ? combineScheduledAt(scheduleDate, scheduleTime) : ''
	);

	function handleNotesInput(event: Event & { currentTarget: HTMLTextAreaElement }) {
		notes = event.currentTarget.value.slice(0, 500);
	}

	function requestLeave(event: MouseEvent, href: string) {
		event.preventDefault();

		if (hasUnsavedChanges) {
			discardModalOpen = true;
			return;
		}

		void goto(href);
	}

	function requestCancel(event?: MouseEvent) {
		event?.preventDefault();

		if (hasUnsavedChanges) {
			discardModalOpen = true;
			return;
		}

		void goto(`/jobs/${jobId}`);
	}

	$effect(() => {
		if (errorMessage) {
			attempted = true;
		}
	});
</script>

<OperatorEditJobHeader
	{reference}
	{jobId}
	onJobsNavigate={(event) => requestLeave(event, '/jobs')}
	onJobNavigate={(event) => requestLeave(event, `/jobs/${jobId}`)}
/>

<CreateJobDiscardModal bind:open={discardModalOpen} leaveHref="/jobs/{jobId}" />

<OperatorPageContent class="gap-6">
	<div class="space-y-1">
		<h1 class="font-syne text-2xl font-bold text-gray-900 dark:text-slate-100">
			Edit Job {reference}
		</h1>
		<p class="font-inter text-sm text-gray-500 dark:text-slate-400">
			Update the details for this delivery job
		</p>
	</div>

	<div class="grid items-start gap-6 xl:grid-cols-[minmax(0,586px)_minmax(0,366px)]">
		<form
			method="POST"
			class="contents"
			use:enhance={({ cancel, submitter }) => {
				const isDelete = submitter instanceof HTMLButtonElement && submitter.name === 'delete';

				if (isDelete) {
					deleting = true;
					return async ({ result, update }) => {
						deleting = false;

						if (result.type === 'redirect') {
							await goto(result.location);
							return;
						}

						await update();
					};
				}

				attempted = true;

				if (!canSubmit) {
					cancel();
					return;
				}

				submitting = true;
				return async ({ result, update }) => {
					submitting = false;

					if (result.type === 'redirect') {
						await goto(result.location);
						return;
					}

					await update();
				};
			}}
		>
			<section class="{createJobFormCardClass} flex flex-col gap-5">
				{#if showErrorBanner}
					<CreateJobErrorBanner />
				{/if}

				<div class="flex items-center gap-1.5">
					<Package size={14} class="text-gray-500 dark:text-slate-400" aria-hidden="true" />
					<span class={createJobSectionLabelClass}>Delivery details</span>
				</div>

				<div class="space-y-0">
					<CreateJobAddressField
						id="pickup-address"
						name="pickup_address"
						latName="pickup_lat"
						lngName="pickup_lng"
						label="Pickup address"
						pinColor="green"
						bind:value={pickupAddress}
						bind:lat={pickupLat}
						bind:lng={pickupLng}
						error={fieldErrors.pickup}
					/>
					{#if pickupAddress.trim() && dropoffAddress.trim()}
						<CreateJobRouteConnector />
					{/if}
					<CreateJobAddressField
						id="dropoff-address"
						name="dropoff_address"
						latName="dropoff_lat"
						lngName="dropoff_lng"
						label="Drop off address"
						pinColor="red"
						bind:value={dropoffAddress}
						bind:lat={dropoffLat}
						bind:lng={dropoffLng}
						error={fieldErrors.dropoff}
					/>
				</div>

				<div class="h-px bg-gray-200 dark:bg-slate-700"></div>

				<div class="flex items-center gap-1.5">
					<Calendar size={14} class="text-gray-500 dark:text-slate-400" aria-hidden="true" />
					<span class={createJobSectionLabelClass}>Schedule</span>
				</div>

				<div class="grid gap-3 sm:grid-cols-[minmax(0,310px)_1fr]">
					<CreateJobDatePicker
						id="schedule-date"
						name="schedule_date"
						label="Date"
						bind:value={scheduleDate}
						error={fieldErrors.scheduleDate}
					/>

					<CreateJobTimePicker
						id="schedule-time"
						name="schedule_time"
						label="Time (GMT)"
						bind:value={scheduleTime}
						error={fieldErrors.scheduleTime}
					/>
				</div>

				<input type="hidden" name="scheduled_at" value={scheduledAt} />

				<div class="h-px bg-gray-200 dark:bg-slate-700"></div>

				<div class="flex items-center gap-1.5">
					<Users size={16} class="text-gray-500 dark:text-slate-400" aria-hidden="true" />
					<span class={createJobSectionLabelClass}>Assignment</span>
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="assigned-driver" class={createJobFieldLabelClass}>Assign driver</label>
					<div class="relative">
						<select
							id="assigned-driver"
							name="assigned_driver_id"
							bind:value={driverId}
							aria-invalid={fieldErrors.driver ? 'true' : undefined}
							aria-describedby={fieldErrors.driver ? 'assigned-driver-error' : undefined}
							class="{createJobFieldInputClass} appearance-none pr-10 {fieldErrors.driver
								? createJobFieldInputErrorClass
								: ''}"
						>
							<option value="">Select a driver</option>
							{#each drivers as driver (driver.id)}
								<option value={driver.id}>{driver.full_name}</option>
							{/each}
						</select>
						<ChevronDown
							size={14}
							class="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 dark:text-slate-500"
							aria-hidden="true"
						/>
					</div>
					{#if fieldErrors.driver}
						<p id="assigned-driver-error" class={createJobFieldErrorMessageClass}>
							{fieldErrors.driver}
						</p>
					{/if}
				</div>

				<div class="flex flex-col gap-1.5">
					<div class="flex items-center gap-1">
						<span class={createJobFieldLabelClass}>Assign vehicle</span>
						<Lock size={12} class="text-gray-400 dark:text-slate-500" aria-hidden="true" />
					</div>
					<div class={createJobFieldLockedClass}>Available on Pro plan</div>
				</div>

				<div class="h-px bg-gray-200 dark:bg-slate-700"></div>

				<div class="flex items-center gap-1.5">
					<FileText size={16} class="text-gray-500 dark:text-slate-400" aria-hidden="true" />
					<span class={createJobSectionLabelClass}>Notes</span>
				</div>

				<div class="flex flex-col gap-1.5">
					<div class="flex items-center gap-2">
						<label for="job-notes" class={createJobFieldLabelClass}>Notes</label>
						<span class={createJobOptionalBadgeClass}>Optional</span>
					</div>
					<textarea
						id="job-notes"
						name="notes"
						rows="4"
						value={notes}
						oninput={handleNotesInput}
						placeholder="e.g. Fragile items, leave at reception, call ahead on arrival, gate code 1234..."
						class={createJobTextareaClass}
					></textarea>
					<p class="font-inter text-[11px] text-gray-500 dark:text-slate-400">
						{notesCount} / 500
					</p>
				</div>

				{#if errorMessage}
					<p class="font-inter text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
				{/if}

				<div class={createJobFormActionsClass}>
					<button type="button" class={createJobCancelLinkClass} onclick={requestCancel}>
						Cancel
					</button>
					<div class={createJobFormRightActionsClass}>
						{#if deletable}
							<button
								type="submit"
								name="delete"
								formaction="?/delete"
								disabled={deleting || submitting}
								class={createJobDeleteButtonClass}
							>
								Delete Job
							</button>
						{/if}
						<Button
							type="submit"
							formaction="?/save"
							variant="brand"
							disabled={submitting || deleting}
							class="px-6 font-syne text-[13px] font-bold {!canSubmit || submitting
								? 'bg-gray-300 text-gray-400 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-500 dark:hover:bg-slate-600'
								: ''}"
						>
							Save Changes
						</Button>
					</div>
				</div>
			</section>
		</form>

		<div class="flex flex-col gap-4">
			<CreateJobPreviewCard
				{pickupAddress}
				{dropoffAddress}
				dateValue={scheduleDate}
				timeValue={scheduleTime}
				{driverId}
				{drivers}
			/>
			<CreateJobTipsCard />
		</div>
	</div>
</OperatorPageContent>
