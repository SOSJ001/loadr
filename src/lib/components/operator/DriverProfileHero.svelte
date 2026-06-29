<script lang="ts">
	import DriverStatusBadge from '$lib/components/operator/DriverStatusBadge.svelte';
	import type { DriverLastActive, DriverStatus } from '$lib/types/drivers';
	import { driverInitials } from '$lib/utils/dashboard';
	import { formatDriverAddedDate } from '$lib/utils/drivers';

	type Props = {
		fullName: string;
		status: DriverStatus;
		addedAt: string;
		jobsThisMonth: number;
		plan: 'free' | 'pro';
		onTimeRate?: number;
		lastActive: DriverLastActive | null;
	};

	let { fullName, status, addedAt, jobsThisMonth, plan, onTimeRate, lastActive }: Props = $props();

	const showOnTimeRate = $derived(plan === 'pro' && onTimeRate != null);
</script>

<div
	class="flex flex-col gap-6 rounded-xl border border-gray-200 bg-gray-50 px-8 py-7 lg:flex-row lg:items-center lg:justify-between dark:border-slate-700 dark:bg-slate-800"
>
	<div class="flex items-center gap-4">
		<div
			class="flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-white bg-brand font-inter text-[22px] font-bold text-white dark:border-slate-800"
			aria-hidden="true"
		>
			{driverInitials(fullName)}
		</div>
		<div class="flex flex-col gap-1.5">
			<h1 class="font-inter text-[22px] font-bold text-gray-900 dark:text-slate-100">
				{fullName}
			</h1>
			<div class="flex flex-wrap items-center gap-3">
				<DriverStatusBadge {status} />
				<span class="size-1 rounded-sm bg-gray-400 dark:bg-slate-500" aria-hidden="true"></span>
				<p class="font-inter text-[13px] text-gray-500 dark:text-slate-400">
					{formatDriverAddedDate(addedAt)}
				</p>
			</div>
		</div>
	</div>

	<div class="flex items-center">
		<div class="px-4 text-center">
			<p class="font-syne text-2xl font-extrabold text-gray-900 dark:text-slate-100">
				{jobsThisMonth}
			</p>
			<p class="font-inter text-xs text-gray-500 dark:text-slate-400">Jobs this month</p>
		</div>
		<div class="h-10 w-px bg-gray-200 dark:bg-slate-700" aria-hidden="true"></div>
		<div class="px-4 text-center">
			{#if showOnTimeRate}
				<p class="font-syne text-2xl font-extrabold text-green-600 dark:text-green-400">
					{onTimeRate}%
				</p>
			{:else}
				<div class="flex items-center justify-center gap-1">
					<p class="font-syne text-2xl font-bold text-gray-500 dark:text-slate-400">—</p>
					<svg
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						class="text-gray-500 dark:text-slate-400"
						aria-hidden="true"
					>
						<rect
							x="2.5"
							y="5"
							width="7"
							height="5"
							rx="1"
							stroke="currentColor"
							stroke-width="1.25"
						/>
						<path
							d="M4 5V3.75a2 2 0 0 1 4 0V5"
							stroke="currentColor"
							stroke-width="1.25"
							stroke-linecap="round"
						/>
					</svg>
				</div>
			{/if}
			<p class="font-inter text-xs text-gray-500 dark:text-slate-400">On-time rate</p>
		</div>
		<div class="h-10 w-px bg-gray-200 dark:bg-slate-700" aria-hidden="true"></div>
		<div class="px-4 text-center">
			{#if lastActive}
				<p class="font-inter text-base font-bold text-gray-900 dark:text-slate-100">
					{lastActive.primary}
				</p>
			{:else}
				<p class="font-inter text-base font-bold text-gray-400 dark:text-slate-500">Never</p>
			{/if}
			<p class="font-inter text-xs text-gray-500 dark:text-slate-400">Last active</p>
		</div>
	</div>
</div>
