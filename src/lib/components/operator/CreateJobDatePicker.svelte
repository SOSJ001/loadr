<script lang="ts">
	import { portal } from '$lib/actions/portal';
	import {
		createJobFieldErrorMessageClass,
		createJobFieldInputClass,
		createJobFieldInputErrorClass
	} from '$lib/components/operator/create-job-ui';
	import { formatCreateJobPreviewDate } from '$lib/utils/operator-create-job';
	import {
		buildCalendarMonth,
		formatCalendarMonthLabel,
		getWeekdayLabels,
		parseDateKey,
		shiftCalendarMonth
	} from '$lib/utils/create-job-datetime';
	import { floatingPanelStyle, positionFloatingPanel } from '$lib/utils/floating-panel';
	import { Calendar, ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { tick } from 'svelte';

	type Props = {
		id: string;
		name: string;
		label: string;
		value?: string;
		error?: string;
	};

	let { id, name, label, value = $bindable(''), error = '' }: Props = $props();

	let open = $state(false);
	let viewMonth = $state(new Date());

	const listboxId = $derived(`${id}-calendar`);
	const errorId = $derived(`${id}-error`);
	const displayValue = $derived(value ? formatCreateJobPreviewDate(value) : 'Select a date');
	const weekdayLabels = getWeekdayLabels();
	const monthCells = $derived(buildCalendarMonth(viewMonth));
	const monthLabel = $derived(formatCalendarMonthLabel(viewMonth));

	function openPicker(event: MouseEvent) {
		event.stopPropagation();
		viewMonth = value ? parseDateKey(value) : new Date();
		open = true;
		void repositionPanel();
	}

	async function repositionPanel() {
		await tick();
		if (!trigger || !panel) return;
		panelPosition = positionFloatingPanel(trigger, panel);
	}

	function closePicker() {
		open = false;
	}

	function selectDate(dateKey: string) {
		value = dateKey;
		closePicker();
	}

	function handleWindowClick(event: MouseEvent) {
		if (!open) return;
		const target = event.target as Node | null;
		if (target && (root?.contains(target) || panel?.contains(target))) return;
		closePicker();
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			event.preventDefault();
			closePicker();
		}
	}

	let root: HTMLDivElement | undefined = $state();
	let trigger: HTMLButtonElement | undefined = $state();
	let panel: HTMLDivElement | undefined = $state();
	let panelPosition = $state({ top: 0, left: 0, width: 280 });

	$effect(() => {
		if (!open || !trigger || !panel) return;

		const update = () => {
			if (trigger && panel) {
				panelPosition = positionFloatingPanel(trigger, panel);
			}
		};

		update();
		requestAnimationFrame(update);

		window.addEventListener('scroll', update, true);
		window.addEventListener('resize', update);

		return () => {
			window.removeEventListener('scroll', update, true);
			window.removeEventListener('resize', update);
		};
	});
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleWindowKeydown} />

<div bind:this={root} class="relative flex flex-col gap-1.5">
	<label for={id} class="font-inter text-[13px] font-medium text-gray-500 dark:text-slate-400">
		{label}
	</label>

	<button
		bind:this={trigger}
		{id}
		type="button"
		class="{createJobFieldInputClass} relative flex items-center pl-11 text-left {error
			? createJobFieldInputErrorClass
			: ''} {value ? 'text-gray-900 dark:text-slate-100' : 'text-gray-400 dark:text-slate-500'}"
		aria-haspopup="dialog"
		aria-expanded={open}
		aria-controls={open ? listboxId : undefined}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? errorId : undefined}
		onclick={openPicker}
	>
		<Calendar
			size={14}
			class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400 dark:text-slate-500"
			aria-hidden="true"
		/>
		{displayValue}
	</button>

	<input type="hidden" {name} {value} />

	{#if error}
		<p id={errorId} class={createJobFieldErrorMessageClass}>{error}</p>
	{/if}

	{#if open}
		<div
			use:portal
			bind:this={panel}
			id={listboxId}
			role="dialog"
			aria-label="Choose date"
			class="fixed z-50 min-w-[280px] rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"
			style={floatingPanelStyle(panelPosition)}
			onclick={(event) => event.stopPropagation()}
		>
			<div class="mb-3 flex items-center justify-between">
				<button
					type="button"
					class="flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
					aria-label="Previous month"
					onclick={() => {
						viewMonth = shiftCalendarMonth(viewMonth, -1);
					}}
				>
					<ChevronLeft size={16} aria-hidden="true" />
				</button>
				<p class="font-inter text-sm font-semibold text-gray-900 dark:text-slate-100">{monthLabel}</p>
				<button
					type="button"
					class="flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
					aria-label="Next month"
					onclick={() => {
						viewMonth = shiftCalendarMonth(viewMonth, 1);
					}}
				>
					<ChevronRight size={16} aria-hidden="true" />
				</button>
			</div>

			<div class="mb-2 grid grid-cols-7 gap-1">
				{#each weekdayLabels as weekday (weekday)}
					<span
						class="font-inter py-1 text-center text-[11px] font-medium text-gray-400 dark:text-slate-500"
					>
						{weekday}
					</span>
				{/each}
			</div>

			<div class="grid grid-cols-7 gap-1">
				{#each monthCells as cell (cell.dateKey)}
					<button
						type="button"
						class="font-inter flex h-9 items-center justify-center rounded-lg text-sm transition-colors {cell.dateKey ===
						value
							? 'bg-brand font-semibold text-white'
							: cell.inMonth
								? 'text-gray-900 hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-slate-800'
								: 'text-gray-300 hover:bg-gray-50 dark:text-slate-600 dark:hover:bg-slate-800/60'} {cell.isToday &&
						cell.dateKey !== value
							? 'ring-1 ring-brand/40 ring-inset'
							: ''}"
						aria-label={cell.dateKey}
						aria-pressed={cell.dateKey === value}
						onclick={() => selectDate(cell.dateKey)}
					>
						{cell.day}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
