<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import DriverConnectivityBanners from '$lib/components/driver/DriverConnectivityBanners.svelte';
	import DriverJobsEmptyState from '$lib/components/driver/DriverJobsEmptyState.svelte';
	import DriverJobsActiveBanner from '$lib/components/driver/DriverJobsActiveBanner.svelte';
	import DriverJobsDateStrip from '$lib/components/driver/DriverJobsDateStrip.svelte';
	import DriverJobsList from '$lib/components/driver/DriverJobsList.svelte';
	import DriverJobsSummaryStrip from '$lib/components/driver/DriverJobsSummaryStrip.svelte';
	import DriverJobsTopBar from '$lib/components/driver/DriverJobsTopBar.svelte';
	import type { DriverJobsPageData } from '$lib/types/driver-jobs';
	import { offlineState } from '$lib/stores/offline.svelte';
	import {
		isDriverJobsBackOnlineSyncPreview,
		isDriverJobsBannerDismissPreview,
		isDriverJobsOfflinePreview,
		isDriverJobsScrolledPreview
	} from '$lib/utils/driver-jobs-theme';

	/** Figma 4F — scroll offset to show list with header pinned. */
	const SCROLLED_PREVIEW_OFFSET_PX = 196;
	const SCROLL_DELTA_THRESHOLD = 6;

	type Props = {
		pageData: DriverJobsPageData;
		preview?: boolean;
	};

	let { pageData, preview = false }: Props = $props();

	let scrollArea = $state<HTMLElement | null>(null);
	let headerExpanded = $state(true);
	let lastScrollTop = 0;
	let reducedMotion = $state(false);

	const isEmpty = $derived(
		!pageData.active_job &&
			pageData.morning_jobs.length === 0 &&
			pageData.afternoon_jobs.length === 0
	);

	const showScrolledPreview = $derived(
		isDriverJobsScrolledPreview(page.url.searchParams.get('preview'))
	);

	const showOfflinePreview = $derived(
		isDriverJobsOfflinePreview(page.url.searchParams.get('preview'))
	);

	const showBannerDismissPreview = $derived(
		isDriverJobsBannerDismissPreview(page.url.searchParams.get('preview'))
	);

	const showBackOnlineSyncPreview = $derived(
		isDriverJobsBackOnlineSyncPreview(page.url.searchParams.get('preview'))
	);

	const showOfflineUi = $derived(showOfflinePreview || !offlineState.online);

	const showSyncDots = $derived(showOfflineUi || showBannerDismissPreview);

	const hideCardSync = $derived(
		showBackOnlineSyncPreview ||
			(offlineState.online &&
				!offlineState.syncError &&
				(offlineState.syncing || offlineState.pendingSyncCount > 0))
	);

	const collapseTransitionClass = $derived(
		reducedMotion ? '' : 'transition-[grid-template-rows] duration-300 ease-out'
	);

	function selectDate(date: string) {
		if (preview) return;

		const params = new URLSearchParams(page.url.searchParams);
		params.set('date', date);
		void goto(`?${params.toString()}`);
	}

	function handleScroll(event: Event) {
		const target = event.currentTarget as HTMLElement;
		const scrollTop = target.scrollTop;
		const delta = scrollTop - lastScrollTop;

		if (scrollTop <= 4) {
			headerExpanded = true;
		} else if (delta > SCROLL_DELTA_THRESHOLD) {
			headerExpanded = false;
		} else if (delta < -SCROLL_DELTA_THRESHOLD) {
			headerExpanded = true;
		}

		lastScrollTop = scrollTop;
	}

	onMount(async () => {
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (!showScrolledPreview) return;

		await tick();
		requestAnimationFrame(() => {
			if (!scrollArea) return;
			scrollArea.scrollTop = SCROLLED_PREVIEW_OFFSET_PX;
			lastScrollTop = SCROLLED_PREVIEW_OFFSET_PX;
			headerExpanded = false;
		});
	});
</script>

<div class="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
	<div class="shrink-0 bg-white dark:bg-slate-900">
		<DriverJobsTopBar
			greeting={pageData.greeting}
			driverFirstName={pageData.driver_first_name}
			hasUnreadNotifications={pageData.has_unread_notifications}
		/>

		<DriverConnectivityBanners />

		<div
			class="grid {collapseTransitionClass} {headerExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}"
		>
			<div class="min-h-0 overflow-hidden">
				<div class="h-1" aria-hidden="true"></div>

				<DriverJobsDateStrip
					selectedDateLabel={pageData.selected_date_label}
					datePills={pageData.date_pills}
					selectedDate={pageData.selected_date}
					onSelectDate={preview ? undefined : selectDate}
				/>

				<div class="h-4" aria-hidden="true"></div>
				<DriverJobsSummaryStrip stats={pageData.stats} showSyncDots={showSyncDots} />
				<div class="h-4" aria-hidden="true"></div>

				<div class="h-px bg-gray-200 dark:bg-slate-600" aria-hidden="true"></div>
			</div>
		</div>
	</div>

	<div
		bind:this={scrollArea}
		class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
		onscroll={handleScroll}
	>
		{#if isEmpty}
			<DriverJobsEmptyState />
		{:else}
			{#if pageData.active_job}
				<div class="pt-4">
					<DriverJobsActiveBanner activeJob={pageData.active_job} />
				</div>
				<div class="h-4" aria-hidden="true"></div>
			{/if}

			<DriverJobsList
				morningJobs={pageData.morning_jobs}
				afternoonJobs={pageData.afternoon_jobs}
				{hideCardSync}
			/>
		{/if}
	</div>
</div>
