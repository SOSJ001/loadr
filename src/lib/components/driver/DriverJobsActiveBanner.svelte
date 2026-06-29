<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';
	import type { DriverJobActiveBanner } from '$lib/types/driver-jobs';

	type Props = {
		activeJob: DriverJobActiveBanner;
	};

	let { activeJob }: Props = $props();
</script>

<div class="px-5">
	<a
		href="/jobs/{activeJob.id}"
		class="flex h-[72px] items-center justify-between rounded-[14px] bg-gradient-to-r from-brand to-[#0f6e56] px-4"
	>
		<div class="flex flex-col gap-1">
			<p
				class="font-inter text-xs font-semibold tracking-[0.72px] text-cyan-100 uppercase"
			>
				Job in progress
			</p>
			<p class="font-syne text-base font-bold text-white">
				{activeJob.reference} · {activeJob.destination_label}
			</p>
		</div>
		<ChevronRight size={22} class="text-white" stroke-width={1.75} aria-hidden="true" />
	</a>
</div>
