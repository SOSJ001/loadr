<script lang="ts">
	import { jobDetailCardClass } from '$lib/components/operator/job-detail-ui';
	import { driverInitials } from '$lib/utils/dashboard';
	import {
		formatJobDetailScheduledDate,
		formatJobDetailScheduledTime
	} from '$lib/utils/operator-job-detail';
	import { MapPin } from '@lucide/svelte';

	type Props = {
		pickupAddress: string;
		dropoffAddress: string;
		scheduledAt: string;
		driverName: string;
		driverStatus: string;
		notes: string;
	};

	let { pickupAddress, dropoffAddress, scheduledAt, driverName, driverStatus, notes }: Props =
		$props();

	const cardClass = jobDetailCardClass;
	const labelClass =
		'font-inter text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400';
</script>

<section class={cardClass}>
	<div class="flex items-center justify-between">
		<h2 class="font-syne text-base font-bold text-gray-900 dark:text-slate-100">Job Details</h2>
		<MapPin size={18} class="text-brand" aria-hidden="true" />
	</div>

	<div class="mt-4 grid gap-6 sm:grid-cols-2">
		<div class="relative flex flex-col gap-6 pl-3">
			<div class="absolute top-2 bottom-2 left-0 w-px bg-gray-200 dark:bg-slate-600"></div>

			<div class="flex flex-col gap-1.5">
				<div class="flex items-center gap-1.5">
					<span class="size-2 shrink-0 rounded-sm bg-green-600" aria-hidden="true"></span>
					<span class={labelClass}>Pickup</span>
				</div>
				<p class="font-inter text-sm font-medium text-gray-900 dark:text-slate-100">
					{pickupAddress}
				</p>
			</div>

			<div class="flex flex-col gap-1.5">
				<div class="flex items-center gap-1.5">
					<span class="size-2 shrink-0 rounded-sm bg-red-600" aria-hidden="true"></span>
					<span class={labelClass}>Drop off</span>
				</div>
				<p class="font-inter text-sm font-medium text-gray-900 dark:text-slate-100">
					{dropoffAddress}
				</p>
			</div>
		</div>

		<div class="flex flex-col gap-6">
			<div class="flex flex-col gap-1">
				<span class={labelClass}>Scheduled</span>
				<p class="font-inter text-sm font-medium text-gray-900 dark:text-slate-100">
					{formatJobDetailScheduledDate(scheduledAt)}
				</p>
				<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">
					{formatJobDetailScheduledTime(scheduledAt)}
				</p>
			</div>

			<div class="flex flex-col gap-2">
				<span class={labelClass}>Driver</span>
				<div class="flex items-center gap-2">
					<div
						class="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-brand font-inter text-xs font-semibold text-white"
						aria-hidden="true"
					>
						{driverInitials(driverName)}
					</div>
					<div>
						<p class="font-inter text-sm font-medium text-gray-900 dark:text-slate-100">
							{driverName}
						</p>
						<p class="font-inter text-xs text-green-600 dark:text-green-400">{driverStatus}</p>
					</div>
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<span class={labelClass}>Notes</span>
				<p class="font-inter text-sm font-medium text-gray-900 dark:text-slate-100">{notes}</p>
			</div>
		</div>
	</div>
</section>
