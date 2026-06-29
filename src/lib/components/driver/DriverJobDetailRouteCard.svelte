<script lang="ts">
	import { ExternalLink, MapPin, Navigation } from '@lucide/svelte';
	import { mapsDirectionsUrl } from '$lib/utils/driver-job-detail';

	type Props = {
		pickupAddress: string;
		dropoffAddress: string;
		directionsAddress: string;
	};

	let { pickupAddress, dropoffAddress, directionsAddress }: Props = $props();

	function openDirections() {
		window.open(mapsDirectionsUrl(directionsAddress), '_blank', 'noopener,noreferrer');
	}
</script>

<section
	class="flex w-full flex-col gap-2 rounded-[14px] border border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-slate-800"
>
	<div class="flex gap-3">
		<div
			class="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-950"
			aria-hidden="true"
		>
			<MapPin size={14} class="text-green-600 dark:text-green-500" stroke-width={2} />
		</div>
		<div class="min-w-0">
			<p class="font-inter text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-slate-400">
				Pickup
			</p>
			<p class="font-inter text-[15px] font-semibold text-gray-900 dark:text-slate-100">{pickupAddress}</p>
		</div>
	</div>

	<div class="pl-[15px]" aria-hidden="true">
		<div class="h-6 w-0.5 border-l-2 border-dashed border-gray-200 dark:border-slate-700"></div>
	</div>

	<div class="flex gap-3">
		<div
			class="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950"
			aria-hidden="true"
		>
			<MapPin size={14} class="text-red-600 dark:text-red-500" stroke-width={2} />
		</div>
		<div class="min-w-0">
			<p class="font-inter text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-slate-400">
				Drop off
			</p>
			<p class="font-inter text-[15px] font-semibold text-gray-900 dark:text-slate-100">{dropoffAddress}</p>
		</div>
	</div>

	<div class="h-2" aria-hidden="true"></div>

	<button
		type="button"
		class="font-inter flex h-12 w-full items-center justify-between rounded-[10px] border border-gray-200 px-4 text-left transition-colors hover:bg-gray-100 dark:border-slate-700 dark:hover:bg-slate-700/40"
		onclick={openDirections}
	>
		<span class="flex items-center gap-2">
			<Navigation size={18} class="text-brand" stroke-width={2} aria-hidden="true" />
			<span class="text-[15px] font-semibold text-brand">Get directions</span>
		</span>
		<ExternalLink size={14} class="text-gray-400 dark:text-slate-400" stroke-width={2} aria-hidden="true" />
	</button>
</section>
