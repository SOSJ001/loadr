<script lang="ts">
	import DriverJobDetailActionBar from '$lib/components/driver/DriverJobDetailActionBar.svelte';
	import DriverJobDetailAttemptedBanner from '$lib/components/driver/DriverJobDetailAttemptedBanner.svelte';
	import DriverJobDetailCompleteBanner from '$lib/components/driver/DriverJobDetailCompleteBanner.svelte';
	import DriverJobDetailInfoCard from '$lib/components/driver/DriverJobDetailInfoCard.svelte';
	import DriverJobDetailProgressCard from '$lib/components/driver/DriverJobDetailProgressCard.svelte';
	import DriverJobDetailRouteCard from '$lib/components/driver/DriverJobDetailRouteCard.svelte';
	import DriverJobDetailTopNav from '$lib/components/driver/DriverJobDetailTopNav.svelte';
	import type { DriverJobDetailPageData } from '$lib/types/driver-job-detail';

	type Props = {
		pageData: DriverJobDetailPageData;
		preview?: boolean;
		formError?: string | null;
	};

	let { pageData, preview = false, formError = null }: Props = $props();

	const scrollPaddingClass = $derived(
		pageData.status === 'in_progress'
			? 'pb-52'
			: pageData.completion_banner
				? 'pb-32'
				: pageData.attempted_banner
					? 'pb-44'
					: 'pb-40'
	);
</script>

<div class="flex min-h-full flex-1 flex-col bg-white dark:bg-slate-900">
	<DriverJobDetailTopNav reference={pageData.reference} status={pageData.status} />

	<div class="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pt-5 {scrollPaddingClass}">
		<DriverJobDetailRouteCard
			pickupAddress={pageData.pickup_address}
			dropoffAddress={pageData.dropoff_address}
			directionsAddress={pageData.directions_address}
		/>

		<DriverJobDetailInfoCard
			scheduledDateLabel={pageData.scheduled_date_label}
			scheduledTimeLabel={pageData.scheduled_time_label}
			vehicleLabel={pageData.vehicle_label}
			notes={pageData.notes}
		/>

		<DriverJobDetailProgressCard
			status={pageData.status}
			stages={pageData.progress_stages}
		/>
	</div>

	{#if pageData.completion_banner}
		<DriverJobDetailCompleteBanner timeLabel={pageData.completion_banner.time_label} />
	{:else if pageData.attempted_banner}
		<DriverJobDetailAttemptedBanner reason={pageData.attempted_banner.reason} />
	{:else}
		<DriverJobDetailActionBar
			jobId={pageData.id}
			primaryAction={pageData.primary_action}
			secondaryActions={pageData.secondary_actions}
			{preview}
			{formError}
		/>
	{/if}
</div>
