<script lang="ts">
	import JobDetailCostCard from '$lib/components/operator/JobDetailCostCard.svelte';
	import JobDetailDetailsCard from '$lib/components/operator/JobDetailDetailsCard.svelte';
	import JobDetailPodCard from '$lib/components/operator/JobDetailPodCard.svelte';
	import JobDetailTimelineCard from '$lib/components/operator/JobDetailTimelineCard.svelte';
	import OperatorJobDetailHeader from '$lib/components/operator/OperatorJobDetailHeader.svelte';
	import OperatorJobStatusBadge from '$lib/components/operator/OperatorJobStatusBadge.svelte';
	import OperatorPageContent from '$lib/components/operator/OperatorPageContent.svelte';
	import type { OperatorJobDetailPageData } from '$lib/types/operator-job-detail';
	import { formatJobDetailCreatedAt } from '$lib/utils/operator-job-detail';

	type Props = {
		pageData: OperatorJobDetailPageData;
	};

	let { pageData }: Props = $props();
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<OperatorJobDetailHeader
	reference={pageData.reference}
	jobId={pageData.id}
	invoiceEnabled={pageData.invoice_enabled}
/>

<OperatorPageContent class="gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex flex-wrap items-center gap-3">
			<h1 class="font-syne text-2xl font-bold text-gray-900 dark:text-slate-100">
				Job {pageData.reference}
			</h1>
			<OperatorJobStatusBadge status={pageData.status} />
		</div>
		<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">
			{formatJobDetailCreatedAt(pageData.created_at)}
		</p>
	</div>

	<div class="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_342px]">
		<div class="flex flex-col gap-4">
			<JobDetailDetailsCard
				pickupAddress={pageData.pickup_address}
				dropoffAddress={pageData.dropoff_address}
				scheduledAt={pageData.scheduled_at}
				driverName={pageData.driver_name}
				driverStatus={pageData.driver_status}
				notes={pageData.notes}
			/>
			<JobDetailTimelineCard events={pageData.timeline} />
		</div>

		<div class="flex flex-col gap-4">
			<JobDetailPodCard pod={pageData.pod} />
			<JobDetailCostCard cost={pageData.cost} />
		</div>
	</div>
</OperatorPageContent>
