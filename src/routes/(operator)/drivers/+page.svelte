<script lang="ts">
	import { page } from '$app/state';
	import OperatorPageContent from '$lib/components/operator/OperatorPageContent.svelte';
	import OperatorPageHeader from '$lib/components/operator/OperatorPageHeader.svelte';
	import DriversAddPanel from '$lib/components/operator/DriversAddPanel.svelte';
	import DriversAtLimitBanner from '$lib/components/operator/DriversAtLimitBanner.svelte';
	import DriversFreePlanBanner from '$lib/components/operator/DriversFreePlanBanner.svelte';
	import DriversStatsStrip from '$lib/components/operator/DriversStatsStrip.svelte';
	import DriversTable from '$lib/components/operator/DriversTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import type { DriverListRow } from '$lib/types/drivers';
	import { driverMatchesSearch } from '$lib/utils/drivers';

	let { data } = $props();

	let searchQuery = $state('');
	let addPanelOpen = $state(false);

	const companyName = $derived(
		typeof page.data.companyName === 'string' ? page.data.companyName : "Dave's Couriers"
	);

	const atDriverLimit = $derived(data.slotUsage.used >= data.slotUsage.limit);

	const statPills = $derived([
		{ label: `${data.stats.active} Active`, dotClass: 'bg-green-600' },
		{ label: `${data.stats.pending} Pending`, dotClass: 'bg-gray-400 dark:bg-slate-500' },
		{ label: `${data.stats.jobsThisMonth} Jobs this month`, dotClass: 'bg-blue-500' },
		{ label: `${data.stats.onJobNow} On a job now`, dotClass: 'bg-amber-600' }
	]);

	const filteredDrivers = $derived(
		data.drivers.filter((driver: DriverListRow) => driverMatchesSearch(driver, searchQuery))
	);

	$effect(() => {
		if (data.panelOpen) {
			addPanelOpen = true;
		}
	});

	function openAddPanel() {
		if (!atDriverLimit) {
			addPanelOpen = true;
		}
	}
</script>

<OperatorPageHeader title="Drivers">
	{#snippet actions()}
		<ThemeToggle />
		<Button variant="brand" class="gap-2" type="button" disabled={atDriverLimit} onclick={openAddPanel}>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path
					d="M8 8.25a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z"
					stroke="currentColor"
					stroke-width="1.5"
				/>
				<path
					d="M3.25 13c0-2.21 2.015-4 4.75-4s4.75 1.79 4.75 4"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
				<path
					d="M11.75 3.5v2.5M10.5 4.75h2.5"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
			Add Driver
		</Button>
	{/snippet}
</OperatorPageHeader>

<OperatorPageContent class="gap-4">
	{#if data.plan === 'free'}
		{#if atDriverLimit}
			<DriversAtLimitBanner limit={data.slotUsage.limit} />
		{:else}
			<DriversFreePlanBanner used={data.slotUsage.used} limit={data.slotUsage.limit} />
		{/if}
	{/if}

	<DriversStatsStrip stats={statPills} />

	<label class="relative block">
		<span class="sr-only">Search drivers</span>
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400 dark:text-slate-500"
			aria-hidden="true"
		>
			<circle cx="7" cy="7" r="4.25" stroke="currentColor" stroke-width="1.5" />
			<path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
		<input
			type="search"
			placeholder="Search drivers by name or phone number..."
			bind:value={searchQuery}
			class="font-inter h-11 w-full rounded-lg border border-gray-200 bg-white pr-4 pl-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
		/>
	</label>

	<DriversTable
		drivers={filteredDrivers}
		totalDriverCount={data.drivers.length}
		onAddDriver={openAddPanel}
		addDriverDisabled={atDriverLimit}
		mockResend={data.mockInvite ?? false}
	/>
</OperatorPageContent>

<DriversAddPanel
	bind:open={addPanelOpen}
	{companyName}
	mockInvite={data.mockInvite ?? false}
	previewSuccess={data.panelSuccess}
	previewInvitedName={data.invitedDriverName}
/>
