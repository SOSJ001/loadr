<script lang="ts">
	import OperatorPageContent from '$lib/components/operator/OperatorPageContent.svelte';
	import OperatorPageHeader from '$lib/components/operator/OperatorPageHeader.svelte';
	import DashboardOnboardingBanner from '$lib/components/operator/DashboardOnboardingBanner.svelte';
	import DashboardPendingVerificationBanner from '$lib/components/operator/DashboardPendingVerificationBanner.svelte';
	import DashboardStatCard from '$lib/components/operator/DashboardStatCard.svelte';
	import DashboardRecentJobs from '$lib/components/operator/DashboardRecentJobs.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();

	const actionsLocked = $derived(data.showPendingVerificationBanner);
</script>

<OperatorPageHeader title="Dashboard">
	{#snippet actions()}
		<ThemeToggle />
		{#if actionsLocked}
			<Button variant="brand" class="gap-2" disabled>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path
						d="M8 3.5v9M3.5 8h9"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
				New Job
			</Button>
		{:else}
			<Button href="/jobs/new" variant="brand" class="gap-2">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path
						d="M8 3.5v9M3.5 8h9"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
				New Job
			</Button>
		{/if}
	{/snippet}
</OperatorPageHeader>

<OperatorPageContent class="gap-6">
	{#if data.showPendingVerificationBanner}
		<DashboardPendingVerificationBanner />
	{:else if data.showOnboardingBanner}
		<DashboardOnboardingBanner />
	{/if}

	<div class="grid gap-4 sm:grid-cols-3">
		<DashboardStatCard
			label="Pending"
			value={data.stats.pending}
			description="jobs awaiting pickup"
			tone="pending"
		/>
		<DashboardStatCard
			label="In Progress"
			value={data.stats.inProgress}
			description="jobs currently on the road"
			tone="in_progress"
		/>
		<DashboardStatCard
			label="Completed Today"
			value={data.stats.completedToday}
			description="jobs delivered successfully"
			tone="completed"
		/>
	</div>

	<DashboardRecentJobs
		jobs={data.recentJobs}
		hoverPreviewJobId={data.hoverPreviewJobId}
		{actionsLocked}
	/>
</OperatorPageContent>
