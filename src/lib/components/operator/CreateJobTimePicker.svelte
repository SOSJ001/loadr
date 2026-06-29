<script lang="ts">
	import { portal } from '$lib/actions/portal';
	import {
		createJobFieldErrorMessageClass,
		createJobFieldInputClass,
		createJobFieldInputErrorClass
	} from '$lib/components/operator/create-job-ui';
	import {
		buildClockFacePositions,
		composeTimeValue,
		CREATE_JOB_CLOCK_HOURS,
		CREATE_JOB_CLOCK_MINUTE_ITEMS,
		getScheduleTimezoneNow,
		parseTimeValue,
		SCHEDULE_TIMEZONE
	} from '$lib/utils/create-job-datetime';
	import { floatingPanelStyle, positionFloatingPanel } from '$lib/utils/floating-panel';
	import { formatCreateJobPreviewTime } from '$lib/utils/operator-create-job';
	import { Clock } from '@lucide/svelte';
	import { tick } from 'svelte';

	type Props = {
		id: string;
		name: string;
		label: string;
		value?: string;
		error?: string;
	};

	let { id, name, label, value = $bindable(''), error = '' }: Props = $props();

	const CLOCK_SIZE = 200;
	const CLOCK_RADIUS = 75;

	let open = $state(false);
	let pickerMode = $state<'hour' | 'minute'>('hour');
	let hour12 = $state<number | null>(null);
	let minute = $state<number | null>(null);
	let period = $state<'am' | 'pm' | null>(null);

	const panelId = $derived(`${id}-time-panel`);
	const errorId = $derived(`${id}-error`);
	const displayValue = $derived(value ? formatCreateJobPreviewTime(value) : 'Select a time');
	const hourFace = $derived(buildClockFacePositions(CREATE_JOB_CLOCK_HOURS, CLOCK_SIZE, CLOCK_RADIUS));
	const minuteFace = $derived(
		buildClockFacePositions(CREATE_JOB_CLOCK_MINUTE_ITEMS, CLOCK_SIZE, CLOCK_RADIUS)
	);
	const activeFace = $derived(pickerMode === 'hour' ? hourFace : minuteFace);
	const headerHour = $derived(hour12 ?? '--');
	const headerMinute = $derived(minute == null ? '--' : String(minute).padStart(2, '0'));
	const timezoneLabel = $derived(
		new Intl.DateTimeFormat('en-GB', {
			timeZone: SCHEDULE_TIMEZONE,
			timeZoneName: 'short'
		})
			.formatToParts(new Date())
			.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT'
	);

	function syncFromValue(nextValue: string) {
		const parsed = parseTimeValue(nextValue);
		if (!parsed) {
			const now = getScheduleTimezoneNow();
			hour12 = null;
			minute = null;
			period = now.period;
			pickerMode = 'hour';
			return;
		}

		hour12 = parsed.hour12;
		minute = parsed.minute;
		period = parsed.period;
		pickerMode = 'hour';
	}

	function openPicker(event: MouseEvent) {
		event.stopPropagation();
		syncFromValue(value);
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
		pickerMode = 'hour';
	}

	function commitSelection() {
		if (hour12 == null || minute == null || !period) return;
		value = composeTimeValue(hour12, minute, period);
		closePicker();
	}

	function selectHour(nextHour: number) {
		hour12 = nextHour;
		pickerMode = 'minute';
	}

	function selectMinute(nextMinute: number) {
		minute = nextMinute;
		commitSelection();
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

	const dialButtonClass =
		'font-inter absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs transition-colors';
	const dialSelectedClass = 'bg-brand font-semibold text-white shadow-sm';
	const dialDefaultClass =
		'text-gray-900 hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-slate-800';
	const periodClass =
		'font-inter rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors';
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
		aria-controls={open ? panelId : undefined}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? errorId : undefined}
		onclick={openPicker}
	>
		<Clock
			size={16}
			class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-amber-500"
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
			id={panelId}
			role="dialog"
			aria-label="Choose time"
			class="fixed z-50 min-w-[280px] rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"
			style={floatingPanelStyle(panelPosition)}
			onclick={(event) => event.stopPropagation()}
		>
			<div class="mb-3 flex items-center justify-between gap-2">
				<p class="font-inter text-[11px] font-semibold tracking-wide text-gray-500 uppercase dark:text-slate-400">
					{timezoneLabel}
				</p>
				<p class="font-inter text-[11px] text-gray-400 dark:text-slate-500">
					{pickerMode === 'hour' ? 'Pick hour' : 'Pick minute'}
				</p>
			</div>

			<div class="mb-2 flex items-center justify-center gap-1">
				<button
					type="button"
					class="font-inter rounded-lg px-2 py-0.5 text-2xl font-semibold transition-colors {pickerMode ===
					'hour'
						? 'text-brand'
						: 'text-gray-900 hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-slate-800'}"
					aria-label="Edit hour"
					onclick={() => {
						pickerMode = 'hour';
					}}
				>
					{headerHour}
				</button>
				<span class="font-inter text-2xl font-semibold text-gray-300 dark:text-slate-600">:</span>
				<button
					type="button"
					class="font-inter rounded-lg px-2 py-0.5 text-2xl font-semibold transition-colors {pickerMode ===
					'minute'
						? 'text-brand'
						: 'text-gray-900 hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-slate-800'}"
					aria-label="Edit minute"
					onclick={() => {
						if (hour12 != null) pickerMode = 'minute';
					}}
				>
					{headerMinute}
				</button>
			</div>

			<div class="mb-3 flex justify-center gap-2">
				{#each ['am', 'pm'] as option (option)}
					<button
						type="button"
						class="{periodClass} {period === option
							? 'bg-brand text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}"
						aria-pressed={period === option}
						onclick={() => {
							period = option as 'am' | 'pm';
						}}
					>
						{option}
					</button>
				{/each}
			</div>

			<div
				class="relative mx-auto rounded-full bg-gray-50 dark:bg-slate-800/80"
				style={`width: ${CLOCK_SIZE}px; height: ${CLOCK_SIZE}px;`}
			>
				<div
					class="pointer-events-none absolute inset-3 rounded-full border border-gray-200 dark:border-slate-700"
					aria-hidden="true"
				></div>

				{#each activeFace as item (item.value)}
					<button
						type="button"
						class="{dialButtonClass} {(pickerMode === 'hour' ? hour12 === item.value : minute ===
						item.value)
							? dialSelectedClass
							: dialDefaultClass}"
						style={`left: ${item.x}px; top: ${item.y}px;`}
						aria-label={pickerMode === 'hour' ? `Hour ${item.label}` : `Minute ${item.label}`}
						aria-pressed={pickerMode === 'hour' ? hour12 === item.value : minute === item.value}
						onclick={() => {
							if (pickerMode === 'hour') {
								selectHour(item.value);
							} else {
								selectMinute(item.value);
							}
						}}
					>
						{item.label}
					</button>
				{/each}

				<div
					class="pointer-events-none absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand"
					aria-hidden="true"
				></div>
			</div>
		</div>
	{/if}
</div>
