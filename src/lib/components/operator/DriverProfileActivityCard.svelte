<script lang="ts">
	import type { DriverActivityItem, DriverActivityKind } from '$lib/types/drivers';

	type Props = {
		activity: DriverActivityItem[];
	};

	let { activity }: Props = $props();

	function iconWrapClass(kind: DriverActivityKind) {
		switch (kind) {
			case 'complete':
				return 'bg-green-100 dark:bg-green-950/50';
			case 'started':
				return 'bg-blue-100 dark:bg-blue-950/50';
			case 'attempted':
				return 'bg-red-100 dark:bg-red-950/50';
			case 'activated':
				return 'bg-gray-100 dark:bg-slate-800';
			case 'invite':
				return 'bg-gray-100 dark:bg-slate-800';
		}
	}
</script>

<section
	class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-slate-700 dark:bg-slate-800"
>
	<div class="flex items-center justify-between">
		<h2 class="font-syne text-base font-bold text-gray-900 dark:text-slate-100">Recent Activity</h2>
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			class="text-gray-400 dark:text-slate-500"
			aria-hidden="true"
		>
			<path
				d="M2.5 12.5V7.5M6 12.5V4.5M9.5 12.5V8.5M13.5 12.5V2.5"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
			/>
		</svg>
	</div>

	<ul class="flex flex-col gap-3">
		{#each activity as item (item.id)}
			<li class="flex gap-3">
				<div
					class="flex size-8 shrink-0 items-center justify-center rounded-2xl {iconWrapClass(
						item.kind
					)}"
					aria-hidden="true"
				>
					{#if item.kind === 'complete'}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="text-green-600">
							<circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5" />
							<path
								d="M5.5 8 7 9.5 10.5 6"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					{:else if item.kind === 'started'}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="text-blue-700">
							<rect
								x="1.5"
								y="5.5"
								width="13"
								height="6"
								rx="1"
								stroke="currentColor"
								stroke-width="1.5"
							/>
							<path
								d="M3.5 5.5 5 3h6l1.5 2.5"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linejoin="round"
							/>
						</svg>
					{:else if item.kind === 'attempted'}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="text-red-600">
							<circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5" />
							<path
								d="M8 5.25V8.25M8 10.75h.008"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
					{:else if item.kind === 'invite'}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="text-gray-500">
							<rect
								x="2.5"
								y="4"
								width="11"
								height="8"
								rx="1"
								stroke="currentColor"
								stroke-width="1.5"
							/>
							<path
								d="m2.5 4.75 5.5 4.25 5.5 4.25 5.5 4.25 5.5 4.25 13.5 4.75"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linejoin="round"
							/>
						</svg>
					{:else}
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="text-gray-500">
							<circle cx="8" cy="5.5" r="2" stroke="currentColor" stroke-width="1.5" />
							<path
								d="M3.5 13.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5M11 5.5h2"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
					{/if}
				</div>
				<div class="min-w-0 flex-1">
					<p class="font-inter text-[13px] font-medium text-gray-900 dark:text-slate-100">
						{item.title}
					</p>
					<p class="font-inter text-xs text-gray-500 dark:text-slate-400">
						{item.timestamp_label}
					</p>
				</div>
			</li>
		{/each}
	</ul>

	<div class="flex justify-end">
		<button
			type="button"
			class="font-inter text-[13px] font-medium text-brand transition-colors hover:text-[#178566]"
		>
			View all activity
		</button>
	</div>
</section>
