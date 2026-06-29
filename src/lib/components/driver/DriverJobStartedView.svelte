<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ClipboardList,
		Clock,
		Gem,
		MapPin,
		Navigation,
		Truck
	} from '@lucide/svelte';
	import DriverJobDetailTopNav from '$lib/components/driver/DriverJobDetailTopNav.svelte';
	import DriverJobStartedAutoDirectionsCallout from '$lib/components/driver/DriverJobStartedAutoDirectionsCallout.svelte';
	import type { DriverJobStartedPageData } from '$lib/types/driver-job-started';
	import { mapsDirectionsUrl } from '$lib/utils/driver-job-detail';

	const AUTO_DIRECTIONS_DELAY_MS = 4000;

	type Props = {
		pageData: DriverJobStartedPageData;
		/** True immediately after startJob — enables 6D auto-open Maps countdown. */
		enableAutoDirections?: boolean;
	};

	let { pageData, enableAutoDirections = false }: Props = $props();

	let autoDirectionsCancelled = $state(false);
	let autoDirectionsPending = $state(false);
	let reducedMotion = $state(false);
	let autoDirectionsTimerId: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		if (!enableAutoDirections) return;

		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reducedMotion) return;

		autoDirectionsPending = true;
		autoDirectionsTimerId = window.setTimeout(() => {
			if (!autoDirectionsCancelled) {
				autoDirectionsPending = false;
				openMaps();
			}
		}, AUTO_DIRECTIONS_DELAY_MS);

		return () => {
			if (autoDirectionsTimerId != null) {
				window.clearTimeout(autoDirectionsTimerId);
			}
		};
	});

	function cancelAutoDirections() {
		if (autoDirectionsCancelled) return;
		autoDirectionsCancelled = true;
		autoDirectionsPending = false;
		if (autoDirectionsTimerId != null) {
			window.clearTimeout(autoDirectionsTimerId);
			autoDirectionsTimerId = undefined;
		}
	}

	function openMaps() {
		window.open(mapsDirectionsUrl(pageData.pickup_address), '_blank', 'noopener,noreferrer');
	}

	function openDirections() {
		cancelAutoDirections();
		openMaps();
	}

	const sonarActive = $derived(autoDirectionsPending && !reducedMotion);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="flex min-h-full flex-1 flex-col bg-white dark:bg-slate-900"
	onpointerdown={cancelAutoDirections}
>
	<DriverJobDetailTopNav reference={pageData.reference} status="in_progress" />

	<div class="flex flex-1 flex-col items-center justify-center px-5 pb-44">
		<div class="relative flex size-28 items-center justify-center" aria-hidden="true">
			{#if sonarActive}
				<div
					class="driver-job-started-sonar absolute size-24 rounded-full bg-blue-100 dark:bg-[#1e3a5f]"
				></div>
			{/if}
			<div class="absolute size-28 rounded-full bg-blue-100/35 dark:bg-[#1e3a5f]/35"></div>
			<div
				class="absolute flex size-24 items-center justify-center rounded-full bg-blue-100 dark:bg-[#1e3a5f]"
			></div>
			<div
				class="relative flex size-[72px] items-center justify-center rounded-full bg-blue-700 text-white dark:bg-blue-500"
			>
				<Truck size={32} stroke-width={1.75} />
			</div>
		</div>

		<div class="h-5" aria-hidden="true"></div>

		<h2 class="font-syne text-[26px] font-extrabold text-gray-900 dark:text-slate-100">
			Job started
		</h2>
		<div class="h-1.5" aria-hidden="true"></div>
		<p class="font-inter text-[15px] text-gray-500 dark:text-slate-400">
			Head to the pickup address
		</p>

		<div class="h-6" aria-hidden="true"></div>

		<div class="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
			<Clock size={14} stroke-width={1.75} aria-hidden="true" />
			<p class="font-inter text-sm font-medium">
				Started at {pageData.started_at_label}
			</p>
		</div>

		<div class="h-5" aria-hidden="true"></div>

		<section
			class="flex w-full max-w-[350px] flex-col gap-3 rounded-[14px] border border-gray-200 bg-gray-50 px-5 py-[18px] dark:border-slate-700 dark:bg-slate-800"
		>
			<div class="flex gap-3">
				<div
					class="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-green-100 dark:bg-[#14532d]"
					aria-hidden="true"
				>
					<MapPin size={14} class="text-green-500" stroke-width={2} />
				</div>
				<div class="min-w-0">
					<p class="font-inter text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-slate-400">
						Pickup address
					</p>
					<p class="font-inter text-[15px] font-semibold text-gray-900 dark:text-slate-100">
						{pageData.pickup_address}
					</p>
				</div>
			</div>
			<div class="flex items-center gap-1.5">
				<Navigation size={14} class="text-brand" stroke-width={2} aria-hidden="true" />
				<p class="font-inter text-xs text-brand">Tap below to get directions</p>
			</div>
		</section>

		<div class="h-4" aria-hidden="true"></div>

		<div class="flex flex-wrap items-center justify-center gap-2">
			<span
				class="font-inter inline-flex h-[30px] items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-3 text-xs font-medium text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
			>
				<MapPin size={12} stroke-width={2} aria-hidden="true" />
				{pageData.destination_label}
			</span>
			{#if pageData.show_fragile_tag}
				<span
					class="font-inter inline-flex h-[30px] items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-700 dark:border-[#422006] dark:bg-[#292524] dark:text-[#d97706]"
				>
					<Gem size={12} stroke-width={2} aria-hidden="true" />
					Fragile
				</span>
			{/if}
			<span
				class="font-inter inline-flex h-[30px] items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-3 text-xs font-medium text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
			>
				<Clock size={12} stroke-width={2} aria-hidden="true" />
				{pageData.scheduled_time_label}
			</span>
		</div>
	</div>

	<DriverJobStartedAutoDirectionsCallout
		visible={autoDirectionsPending}
		durationMs={AUTO_DIRECTIONS_DELAY_MS}
		onCancel={cancelAutoDirections}
	/>

	<div
		class="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-5 pt-4 pb-[34px] dark:border-slate-700 dark:bg-slate-900"
	>
		<div class="mx-auto flex w-full max-w-[390px] flex-col">
			<button
				type="button"
				class="font-syne flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-bold text-white transition-opacity hover:opacity-90"
				onclick={openDirections}
			>
				<Navigation size={18} stroke-width={2} aria-hidden="true" />
				Get directions
			</button>
			<div class="h-2" aria-hidden="true"></div>
			<a
				href="/jobs/{pageData.id}"
				class="font-syne flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-gray-200 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
				onclick={cancelAutoDirections}
			>
				<ClipboardList size={16} stroke-width={2} aria-hidden="true" />
				View job details
			</a>
		</div>
	</div>
</div>

<style>
	@keyframes driver-job-started-sonar {
		0% {
			transform: scale(1);
			opacity: 0.45;
		}
		100% {
			transform: scale(calc(112 / 96));
			opacity: 0;
		}
	}

	.driver-job-started-sonar {
		animation: driver-job-started-sonar 2s ease-out infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.driver-job-started-sonar {
			animation: none;
			display: none;
		}
	}
</style>
