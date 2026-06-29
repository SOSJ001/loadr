<script lang="ts">
	import DriverProfileActivityCard from '$lib/components/operator/DriverProfileActivityCard.svelte';
	import DriverProfileDetailsCard from '$lib/components/operator/DriverProfileDetailsCard.svelte';
	import DriverProfileHeader from '$lib/components/operator/DriverProfileHeader.svelte';
	import DriverProfileHero from '$lib/components/operator/DriverProfileHero.svelte';
	import DriverProfileJobsCard from '$lib/components/operator/DriverProfileJobsCard.svelte';
	import DriverProfilePerformanceCard from '$lib/components/operator/DriverProfilePerformanceCard.svelte';
	import DriverProfileRemoveModal from '$lib/components/operator/DriverProfileRemoveModal.svelte';
	import OperatorPageContent from '$lib/components/operator/OperatorPageContent.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();

	let removeModalOpen = $state(false);

	$effect(() => {
		if (data.removeModalOpen) {
			removeModalOpen = true;
		}
	});
</script>

{#if data.profile}
	{@const profile = data.profile}

	<DriverProfileHeader
		driverName={profile.driver.full_name}
		onRemove={() => {
			removeModalOpen = true;
		}}
	/>

	<DriverProfileRemoveModal
		bind:open={removeModalOpen}
		fullName={profile.driver.full_name}
		status={profile.driver.status}
		mockRemove={data.mockResend ?? false}
	/>

	<OperatorPageContent class="gap-6">
		<DriverProfileHero
			fullName={profile.driver.full_name}
			status={profile.driver.status}
			addedAt={profile.driver.added_at}
			jobsThisMonth={profile.driver.jobs_this_month}
			plan={profile.plan}
			onTimeRate={profile.driver.on_time_rate}
			lastActive={profile.driver.last_active}
		/>

		<div class="flex flex-col gap-6 xl:flex-row xl:items-start">
			<div class="flex min-w-0 flex-1 flex-col gap-4">
				<DriverProfileDetailsCard
					fullName={profile.driver.full_name}
					phone={profile.driver.phone}
					status={profile.driver.status}
					addedAt={profile.driver.added_at}
					inviteLink={profile.invite_link}
					mockResend={data.mockResend ?? false}
				/>
				<DriverProfileJobsCard
					jobsThisMonth={profile.driver.jobs_this_month}
					counts={profile.jobs.counts}
					rows={profile.jobs.rows}
					pagination={profile.jobs.pagination}
					initialTab={data.jobsTab}
				/>
			</div>

			<div class="flex w-full shrink-0 flex-col gap-4 xl:w-[333px]">
				<DriverProfilePerformanceCard
					locked={profile.plan === 'free'}
					performance={profile.performance}
				/>
				<DriverProfileActivityCard activity={profile.activity} />
			</div>
		</div>
	</OperatorPageContent>
{:else}
	<OperatorPageContent class="items-center justify-center gap-4">
		<p class="font-syne text-lg font-bold text-gray-900 dark:text-slate-100">Driver not found</p>
		<Button href="/drivers" variant="secondary">Back to drivers</Button>
	</OperatorPageContent>
{/if}
