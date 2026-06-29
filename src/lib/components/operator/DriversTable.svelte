<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import DriverStatusBadge from '$lib/components/operator/DriverStatusBadge.svelte';
	import CopyIcon from '$lib/components/operator/CopyIcon.svelte';
	import ResendInviteIcon from '$lib/components/operator/ResendInviteIcon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { DriverListRow } from '$lib/types/drivers';
	import { driverInitials } from '$lib/utils/dashboard';
	import { formatDriverAddedDate } from '$lib/utils/drivers';

	type Props = {
		drivers?: DriverListRow[];
		totalDriverCount?: number;
		onAddDriver?: () => void;
		addDriverDisabled?: boolean;
		mockResend?: boolean;
	};

	let {
		drivers = [],
		totalDriverCount = drivers.length,
		onAddDriver,
		addDriverDisabled = false,
		mockResend = false
	}: Props = $props();

	const isInitialEmpty = $derived(drivers.length === 0 && totalDriverCount === 0);
	const isSearchEmpty = $derived(drivers.length === 0 && totalDriverCount > 0);

	let resendingId = $state<string | null>(null);
	let resentIds = $state<Set<string>>(new Set());
	let resendErrors = $state<Record<string, string>>({});

	const actionClass =
		'text-gray-500 transition-colors hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100';

	const rowHoverClass =
		'cursor-pointer transition-colors duration-150 hover:bg-emerald-50 dark:hover:bg-emerald-950/40';

	const headerClass =
		'font-syne px-5 py-3 text-[11px] font-medium tracking-wide text-gray-500 uppercase dark:text-slate-400';

	function rowClass(index: number) {
		const stripe =
			index % 2 === 1 ? 'bg-gray-50 dark:bg-transparent' : 'bg-white dark:bg-transparent';
		return `${rowHoverClass} ${stripe}`;
	}

	function openDriver(driverId: string) {
		goto(`/drivers/${driverId}`);
	}

	function stopRowClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
	}

	async function copyPhone(phone: string) {
		try {
			await navigator.clipboard.writeText(phone);
		} catch {
			// Clipboard unavailable — ignore for UI preview
		}
	}

	function markResent(driverId: string) {
		resentIds = new Set(resentIds).add(driverId);
		setTimeout(() => {
			const next = new Set(resentIds);
			next.delete(driverId);
			resentIds = next;
		}, 2500);
	}

	function handleMockResend(event: SubmitEvent, driverId: string) {
		event.preventDefault();
		if (resendingId === driverId) return;
		resendingId = driverId;
		setTimeout(() => {
			resendingId = null;
			markResent(driverId);
		}, 400);
	}

	function createResendEnhance(driverId: string): SubmitFunction {
		return () => {
			resendingId = driverId;
			resendErrors = Object.fromEntries(
				Object.entries(resendErrors).filter(([id]) => id !== driverId)
			);

			return async ({ result, update }) => {
				resendingId = null;

				if (result.type === 'success') {
					markResent(driverId);
				} else if (result.type === 'failure') {
					const data = result.data as { message?: string } | undefined;
					resendErrors = {
						...resendErrors,
						[driverId]: data?.message ?? 'Failed to resend invite.'
					};
				}

				await update();
			};
		};
	}
</script>

{#if isSearchEmpty}
	<div
		class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-800"
	>
		<svg
			width="48"
			height="48"
			viewBox="0 0 48 48"
			fill="none"
			class="text-gray-300 dark:text-slate-600"
			aria-hidden="true"
		>
			<path
				d="M24 24a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM10 36c0-5.523 6.268-10 14-10s14 4.477 14 10"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			/>
		</svg>
		<p class="font-syne mt-4 text-base font-bold text-gray-900 dark:text-slate-100">
			No drivers match your search
		</p>
		<p class="font-inter mt-2 text-sm text-gray-500 dark:text-slate-400">
			Try a different name or phone number
		</p>
	</div>
{:else}
	<div
		class="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800"
	>
		<table class="min-w-[920px] w-full text-left">
			<thead>
				<tr class="border-b border-gray-200 bg-gray-100 dark:border-slate-700 dark:bg-slate-900">
					<th class="{headerClass}">Driver</th>
					<th class="{headerClass} w-[150px]">Phone</th>
					<th class="{headerClass} w-[120px]">Status</th>
					<th class="{headerClass} w-[140px]">Jobs this month</th>
					<th class="{headerClass} w-[130px]">Last active</th>
					<th class="{headerClass} w-[90px] text-right">Actions</th>
				</tr>
			</thead>
			{#if isInitialEmpty}
				<tbody>
					<tr>
						<td colspan="6" class="p-0">
							<div class="flex flex-col items-center gap-1.5 px-6 py-20 text-center">
								<svg
									width="20"
									height="20"
									viewBox="0 0 16 16"
									fill="none"
									class="text-gray-400 dark:text-slate-500"
									aria-hidden="true"
								>
									<circle cx="8" cy="5.5" r="2" stroke="currentColor" stroke-width="1.5" />
									<path
										d="M3.5 13.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
									/>
								</svg>
								<p class="font-inter text-base font-bold text-gray-900 dark:text-slate-100">
									No drivers yet
								</p>
								<p
									class="font-inter max-w-[300px] text-sm leading-relaxed text-gray-500 dark:text-slate-400"
								>
									Add your first driver to start assigning jobs to them
								</p>
								<Button
									type="button"
									variant="brand"
									class="mt-2 gap-2"
									disabled={addDriverDisabled}
									onclick={onAddDriver}
								>
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
										<path
											d="M8 3.5v9M3.5 8h9"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
										/>
									</svg>
									Add Driver
								</Button>
							</div>
						</td>
					</tr>
				</tbody>
			{:else}
				<tbody>
					{#each drivers as driver, index (driver.id)}
						<tr
							class="border-b border-gray-200 last:border-b-0 dark:border-slate-700 {rowClass(index)}"
							role="link"
							tabindex="0"
							aria-label="Open driver {driver.full_name}"
							onclick={() => openDriver(driver.id)}
							onkeydown={(event) => {
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault();
									openDriver(driver.id);
								}
							}}
						>
							<td class="px-5 py-4">
								<div class="flex items-center gap-3">
									<div
										class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand font-inter text-[13px] font-semibold text-white"
										aria-hidden="true"
									>
										{driverInitials(driver.full_name)}
									</div>
									<div class="min-w-0">
										<p
											class="font-inter text-sm font-semibold text-gray-900 dark:text-slate-100"
										>
											{driver.full_name}
										</p>
										<p class="font-inter text-xs text-gray-500 dark:text-slate-400">
											{formatDriverAddedDate(driver.added_at)}
										</p>
									</div>
								</div>
							</td>
							<td class="px-5 py-4">
								<div class="flex items-center gap-1.5">
									<span class="font-inter text-[13px] text-gray-500 dark:text-slate-400">
										{driver.phone}
									</span>
									{#if driver.phone && driver.show_copy_phone}
										<button
											type="button"
											class="{actionClass} shrink-0 p-0.5"
											aria-label="Copy phone number for {driver.full_name}"
											title="Copy phone number"
											onclick={(event) => {
												stopRowClick(event);
												copyPhone(driver.phone);
											}}
										>
											<CopyIcon />
										</button>
									{/if}
								</div>
							</td>
							<td class="px-5 py-4">
								<DriverStatusBadge status={driver.status} detail={driver.status_detail} />
							</td>
							<td class="px-5 py-4">
								<p class="font-inter text-lg font-bold text-gray-900 dark:text-slate-100">
									{driver.jobs_this_month}
								</p>
								<p class="font-inter text-[11px] text-gray-500 dark:text-slate-400">jobs</p>
							</td>
							<td class="px-5 py-4">
								{#if driver.last_active}
									<p class="font-inter text-[13px] font-medium text-gray-900 dark:text-slate-100">
										{driver.last_active.primary}
									</p>
									{#if driver.last_active.secondary}
										<p class="font-inter text-xs text-gray-500 dark:text-slate-400">
											{driver.last_active.secondary}
										</p>
									{/if}
								{:else}
									<p class="font-inter text-[13px] text-gray-400 dark:text-slate-500">Never</p>
								{/if}
							</td>
							<td class="px-5 py-4">
								<div class="flex items-center justify-end gap-2">
									{#if driver.actions.view}
										<a
											href="/drivers/{driver.id}"
											class={actionClass}
											aria-label="View {driver.full_name}"
											title="View"
											onclick={stopRowClick}
										>
											<svg
												width="16"
												height="16"
												viewBox="0 0 16 16"
												fill="none"
												aria-hidden="true"
											>
												<path
													d="M2.5 8s2.25-3.5 5.5-3.5S13.5 8 13.5 8s-2.25 3.5-5.5 3.5S2.5 8 2.5 8Z"
													stroke="currentColor"
													stroke-width="1.5"
													stroke-linejoin="round"
												/>
												<circle
													cx="8"
													cy="8"
													r="1.75"
													stroke="currentColor"
													stroke-width="1.5"
												/>
											</svg>
										</a>
									{/if}
									{#if driver.actions.resend}
										<form
											method="POST"
											action="?/resend"
											class="inline-flex"
											onsubmit={(event) => {
												if (mockResend) handleMockResend(event, driver.id);
											}}
											use:enhance={mockResend ? undefined : createResendEnhance(driver.id)}
										>
											<input type="hidden" name="driver_id" value={driver.id} />
											<button
												type="submit"
												class="{actionClass} disabled:opacity-50"
												aria-label="Resend invite to {driver.full_name}"
												disabled={resendingId === driver.id}
												title={resendErrors[driver.id] ?? 'Resend invite'}
												onclick={stopRowClick}
											>
												{#if resentIds.has(driver.id)}
													<span class="font-inter text-[11px] font-medium text-green-600 dark:text-green-400">
														Sent
													</span>
												{:else}
													<ResendInviteIcon />
												{/if}
											</button>
										</form>
									{/if}
									{#if driver.actions.more}
										<button
											type="button"
											class={actionClass}
											aria-label="More actions for {driver.full_name}"
											title="More"
											onclick={stopRowClick}
										>
											<svg
												width="16"
												height="16"
												viewBox="0 0 16 16"
												fill="none"
												aria-hidden="true"
											>
												<circle cx="3" cy="8" r="1" fill="currentColor" />
												<circle cx="8" cy="8" r="1" fill="currentColor" />
												<circle cx="13" cy="8" r="1" fill="currentColor" />
											</svg>
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			{/if}
		</table>
	</div>
{/if}
