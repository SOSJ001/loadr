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
	const EXPAND_AT_PX = 8;
	const COLLAPSE_AT_PX = 28;
	/** Need meaningful list scroll room before collapsing the date/stats header. */
	const MIN_OVERFLOW_TO_COLLAPSE_PX = 64;

	type Props = {
		pageData: DriverJobsPageData;
		preview?: boolean;
	};

	let { pageData, preview = false }: Props = $props();

	let scrollArea = $state<HTMLElement | null>(null);
	let headerExpanded = $state(true);
	let reducedMotion = $state(false);
	let scrollRaf = 0;
	let lastScrollTop = 0;

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

	function getScrollOverflow(target: HTMLElement): number {
		return Math.max(0, target.scrollHeight - target.clientHeight);
	}

	function syncHeaderFromScroll(target: HTMLElement) {
		const scrollTop = target.scrollTop;
		const overflow = getScrollOverflow(target);
		const delta = scrollTop - lastScrollTop;

		if (overflow < MIN_OVERFLOW_TO_COLLAPSE_PX) {
			headerExpanded = true;
			lastScrollTop = scrollTop;
			return;
		}

		if (scrollTop <= EXPAND_AT_PX) {
			headerExpanded = true;
		} else if (scrollTop >= COLLAPSE_AT_PX && delta > 0) {
			headerExpanded = false;
		} else if (delta < 0 && scrollTop < COLLAPSE_AT_PX + 16) {
			headerExpanded = true;
		}

		lastScrollTop = scrollTop;
	}

	function handleScroll(event: Event) {
		const target = event.currentTarget as HTMLElement;
		if (scrollRaf) return;

		scrollRaf = requestAnimationFrame(() => {
			scrollRaf = 0;
			syncHeaderFromScroll(target);
		});
	}

	$effect(() => {
		const area = scrollArea;
		if (!area) return;

		syncHeaderFromScroll(area);

		const observer = new ResizeObserver(() => {
			syncHeaderFromScroll(area);
		});

		observer.observe(area);
		return () => observer.disconnect();
	});

	$effect(() => {
		pageData.selected_date;
		pageData.morning_jobs.length;
		pageData.afternoon_jobs.length;
		pageData.active_job?.id;

		if (!scrollArea) return;
		syncHeaderFromScroll(scrollArea);
	});

	onMount(() => {
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (showScrolledPreview) {
			void tick().then(() => {
				requestAnimationFrame(() => {
					if (!scrollArea) return;
					scrollArea.scrollTop = SCROLLED_PREVIEW_OFFSET_PX;
					lastScrollTop = SCROLLED_PREVIEW_OFFSET_PX;
					headerExpanded = false;
				});
			});
		}

		return () => {
			if (scrollRaf) cancelAnimationFrame(scrollRaf);
		};
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
		class="min-h-0 flex-1 overscroll-y-contain [-webkit-overflow-scrolling:touch] {isEmpty
			? 'flex flex-col overflow-hidden'
			: 'overflow-y-auto'}"
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
