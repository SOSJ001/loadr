<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import CreateJobAddressField from '$lib/components/operator/CreateJobAddressField.svelte';
	import CreateJobDatePicker from '$lib/components/operator/CreateJobDatePicker.svelte';
	import CreateJobDiscardModal from '$lib/components/operator/CreateJobDiscardModal.svelte';
	import CreateJobErrorBanner from '$lib/components/operator/CreateJobErrorBanner.svelte';
	import CreateJobSuccessModal from '$lib/components/operator/CreateJobSuccessModal.svelte';
	import CreateJobPreviewCard from '$lib/components/operator/CreateJobPreviewCard.svelte';
	import CreateJobRouteConnector from '$lib/components/operator/CreateJobRouteConnector.svelte';
	import CreateJobTimePicker from '$lib/components/operator/CreateJobTimePicker.svelte';
	import CreateJobTipsCard from '$lib/components/operator/CreateJobTipsCard.svelte';
	import OperatorCreateJobHeader from '$lib/components/operator/OperatorCreateJobHeader.svelte';
	import OperatorPageContent from '$lib/components/operator/OperatorPageContent.svelte';
	import {
		createJobCancelLinkClass,
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
		hasCreateJobUnsavedChanges,
		type CreateJobDriverOption,
		type CreateJobFormSeed,
		validateCreateJobForm
	} from '$lib/utils/operator-create-job';
	import {
		Calendar,
		ChevronDown,
		FileText,
		Lock,
		Package,
		Plus,
		Users
	} from '@lucide/svelte';

	type Props = {
		drivers: CreateJobDriverOption[];
		errorMessage?: string | null;
		forceValidation?: boolean;
		showDiscardModal?: boolean;
		seed?: CreateJobFormSeed | null;
	};

	type CreateJobSuccessResult = {
		success: true;
		job: { id: string; reference: string };
	};

	let {
		drivers,
		errorMessage = null,
		forceValidation = false,
		showDiscardModal = false,
		seed = null
	}: Props = $props();

	let pickupAddress = $state(seed?.pickupAddress ?? '');
	let dropoffAddress = $state(seed?.dropoffAddress ?? '');
	let pickupLat = $state<number | null>(seed?.pickupLat ?? null);
	let pickupLng = $state<number | null>(seed?.pickupLng ?? null);
	let dropoffLat = $state<number | null>(seed?.dropoffLat ?? null);
	let dropoffLng = $state<number | null>(seed?.dropoffLng ?? null);
	let scheduleDate = $state(seed?.scheduleDate ?? '');
	let scheduleTime = $state(seed?.scheduleTime ?? '');
	let driverId = $state(seed?.driverId ?? '');
	let notes = $state(seed?.notes ?? '');
	let submitting = $state(false);
	let attempted = $state(forceValidation);
	let discardModalOpen = $state(showDiscardModal);
	let successModalOpen = $state(false);
	let createdJobId = $state('');
	let createdJobReference = $state('');
	let createdDriverName = $state('');
	let formResetKey = $state(0);

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
		hasCreateJobUnsavedChanges({
			...formValues,
			notes
		})
	);

	const scheduledAt = $derived(
		scheduleDate && scheduleTime ? combineScheduledAt(scheduleDate, scheduleTime) : ''
	);

	function handleNotesInput(event: Event & { currentTarget: HTMLTextAreaElement }) {
		notes = event.currentTarget.value.slice(0, 500);
	}

	function resetFormFields() {
		pickupAddress = '';
		dropoffAddress = '';
		pickupLat = null;
		pickupLng = null;
		dropoffLat = null;
		dropoffLng = null;
		scheduleDate = '';
		scheduleTime = '';
		driverId = '';
		notes = '';
		attempted = false;
	}

	function requestLeave(event?: MouseEvent) {
		event?.preventDefault();

		if (hasUnsavedChanges) {
			discardModalOpen = true;
			return;
		}

		void goto('/jobs');
	}

	$effect(() => {
		if (errorMessage) {
			attempted = true;
		}
	});
</script>

<OperatorCreateJobHeader onJobsNavigate={requestLeave} />

<CreateJobDiscardModal bind:open={discardModalOpen} />

<CreateJobSuccessModal
	bind:open={successModalOpen}
	jobId={createdJobId}
	reference={createdJobReference}
	driverName={createdDriverName}
/>

<OperatorPageContent class="gap-6">
	<div class="space-y-1">
		<h1 class="font-syne text-2xl font-bold text-gray-900 dark:text-slate-100">Create New Job</h1>
		<p class="font-inter text-sm text-gray-500 dark:text-slate-400">
			Fill in the details below to assign a new delivery job
		</p>
	</div>

	<div class="grid items-start gap-6 xl:grid-cols-[minmax(0,586px)_minmax(0,366px)]">
		<form
			method="POST"
			class="contents"
			use:enhance={({ cancel }) => {
				attempted = true;

				if (!canSubmit) {
					cancel();
					return;
				}

				submitting = true;
				return async ({ result, update }) => {
					submitting = false;

					if (
						result.type === 'success' &&
						result.data &&
						typeof result.data === 'object' &&
						'success' in result.data &&
						result.data.success
					) {
						const data = result.data as CreateJobSuccessResult;
						createdJobId = data.job.id;
						createdJobReference = data.job.reference;
						createdDriverName =
							drivers.find((driver) => driver.id === driverId)?.full_name ?? '';
						resetFormFields();
						formResetKey += 1;
						successModalOpen = true;
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
					{#key formResetKey}
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
					{/key}
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
					<button type="button" class={createJobCancelLinkClass} onclick={requestLeave}>
						Cancel
					</button>
					<Button
						type="submit"
						variant="brand"
						disabled={submitting}
						class="gap-2 px-6 {!canSubmit || submitting
							? 'bg-gray-300 text-gray-400 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-500 dark:hover:bg-slate-600'
							: ''}"
					>
						<Plus size={16} aria-hidden="true" />
						Create Job
					</Button>
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
