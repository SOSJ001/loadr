<script lang="ts">
	import { jobDetailCardClass } from '$lib/components/operator/job-detail-ui';
	import CreateJobRouteConnector from '$lib/components/operator/CreateJobRouteConnector.svelte';
	import {
		formatCreateJobPreviewDate,
		formatCreateJobPreviewTime,
		type CreateJobDriverOption
	} from '$lib/utils/operator-create-job';
	import { Calendar, Clock, Eye, User } from '@lucide/svelte';

	type Props = {
		pickupAddress: string;
		dropoffAddress: string;
		dateValue: string;
		timeValue: string;
		driverId: string;
		drivers: CreateJobDriverOption[];
	};

	let { pickupAddress, dropoffAddress, dateValue, timeValue, driverId, drivers }: Props = $props();

	const cardClass = jobDetailCardClass;

	const pickupPreview = $derived(pickupAddress.trim() || 'Not set yet');
	const dropoffPreview = $derived(dropoffAddress.trim() || 'Not set yet');
	const datePreview = $derived(
		dateValue ? formatCreateJobPreviewDate(dateValue) : '—'
	);
	const timePreview = $derived(formatCreateJobPreviewTime(timeValue));
	const driverPreview = $derived.by(() => {
		if (!driverId) return '—';
		return drivers.find((driver) => driver.id === driverId)?.full_name ?? '—';
	});

	const mutedValueClass = 'font-inter text-[13px] text-gray-400 dark:text-slate-500';
	const setValueClass = 'font-inter text-[13px] font-medium text-gray-900 dark:text-slate-100';
	const hasRoute = $derived(Boolean(pickupAddress.trim() && dropoffAddress.trim()));
</script>

<section class={cardClass}>
	<div class="flex items-center justify-between">
		<h2 class="font-syne text-base font-bold text-gray-900 dark:text-slate-100">Job Preview</h2>
		<Eye size={16} class="text-brand" aria-hidden="true" />
	</div>

	<div class="mt-4 space-y-1">
		<div class="space-y-1">
			<div class="flex items-center gap-2">
				<span class="size-2 shrink-0 rounded-sm bg-green-600" aria-hidden="true"></span>
				<span class="font-inter text-[11px] font-medium text-gray-500 dark:text-slate-400">
					PICKUP
				</span>
			</div>
			<p class={pickupAddress.trim() ? setValueClass : mutedValueClass}>{pickupPreview}</p>
		</div>

		{#if hasRoute}
			<CreateJobRouteConnector compact />
		{/if}

		<div class="space-y-1">
			<div class="flex items-center gap-2">
				<span class="size-2 shrink-0 rounded-sm bg-red-600" aria-hidden="true"></span>
				<span class="font-inter text-[11px] font-medium text-gray-500 dark:text-slate-400">
					DROP OFF
				</span>
			</div>
			<p class={dropoffAddress.trim() ? setValueClass : mutedValueClass}>{dropoffPreview}</p>
		</div>
	</div>

	<div class="my-4 h-px bg-gray-200 dark:bg-slate-700"></div>

	<div class="grid grid-cols-3 gap-3">
		<div class="flex flex-col gap-1">
			<Calendar size={14} class="text-gray-400 dark:text-slate-500" aria-hidden="true" />
			<p class={dateValue ? setValueClass : mutedValueClass}>{datePreview}</p>
		</div>
		<div class="flex flex-col gap-1">
			<Clock size={16} class="text-gray-400 dark:text-slate-500" aria-hidden="true" />
			<p class={timeValue ? setValueClass : mutedValueClass}>{timePreview}</p>
		</div>
		<div class="flex flex-col gap-1">
			<User size={14} class="text-gray-400 dark:text-slate-500" aria-hidden="true" />
			<p class={driverId ? setValueClass : mutedValueClass}>{driverPreview}</p>
		</div>
	</div>
</section>
