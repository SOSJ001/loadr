<script lang="ts">
	import { portal } from '$lib/actions/portal';
	import {
		createJobFieldErrorMessageClass,
		createJobFieldInputClass,
		createJobFieldInputErrorClass
	} from '$lib/components/operator/create-job-ui';
	import type { AddressSuggestion } from '$lib/server/places';
	import { floatingPanelStyle, positionFloatingPanel } from '$lib/utils/floating-panel';
	import { MapPin, Search } from '@lucide/svelte';
	import { tick } from 'svelte';

	type Props = {
		id: string;
		name: string;
		latName: string;
		lngName: string;
		label: string;
		pinColor: 'green' | 'red';
		value?: string;
		lat?: number | null;
		lng?: number | null;
		error?: string;
	};

	let {
		id,
		name,
		latName,
		lngName,
		label,
		pinColor,
		value = $bindable(''),
		lat = $bindable<number | null>(null),
		lng = $bindable<number | null>(null),
		error = ''
	}: Props = $props();

	const searchButtonId = $derived(`${id}-search`);
	const errorId = $derived(`${id}-error`);
	const hintId = $derived(`${id}-hint`);

	let suggestions = $state<AddressSuggestion[]>([]);
	let open = $state(false);
	let loading = $state(false);
	let resolving = $state(false);
	let searchHint = $state('');
	let lastSearchedQuery = $state('');
	let blurTimer: ReturnType<typeof setTimeout> | undefined;
	let panelPosition = $state({ top: 0, left: 0, width: 280 });
	let fetchRequestId = 0;
	let rateLimitedUntil = $state(0);

	const pinClass = $derived(pinColor === 'green' ? 'text-green-600' : 'text-red-600');
	const listboxId = $derived(`${id}-results`);
	const showDropdown = $derived(open && suggestions.length > 0 && !resolving);
	const isRateLimited = $derived(Date.now() < rateLimitedUntil);
	const canSearch = $derived(
		value.trim().length >= 3 && !loading && !resolving && !isRateLimited
	);
	const describedBy = $derived(
		[error ? errorId : '', searchHint ? hintId : ''].filter(Boolean).join(' ') || undefined
	);

	function clearSelection() {
		lat = null;
		lng = null;
	}

	function cancelBlurClose() {
		clearTimeout(blurTimer);
	}

	function scheduleBlurClose() {
		cancelBlurClose();
		blurTimer = window.setTimeout(() => {
			if (resolving) return;
			if (anchor?.contains(document.activeElement)) return;
			open = false;
		}, 200);
	}

	async function repositionPanel() {
		await tick();
		if (!anchor || !panel) return;
		panelPosition = positionFloatingPanel(anchor, panel);
	}

	async function fetchSuggestions(query: string, requestId: number) {
		const trimmed = query.trim();

		if (trimmed.length < 3) {
			searchHint = 'Enter at least 3 characters, then click Search.';
			suggestions = [];
			open = false;
			return;
		}

		loading = true;
		searchHint = '';

		try {
			const response = await fetch(`/api/v1/places/search?q=${encodeURIComponent(trimmed)}`, {
				credentials: 'same-origin'
			});

			if (requestId !== fetchRequestId) return;

			const data = (await response.json().catch(() => null)) as
				| { suggestions?: AddressSuggestion[]; mock?: boolean }
				| { error?: { message?: string } }
				| null;

			if (!response.ok) {
				suggestions = [];
				open = false;

				if (response.status === 429) {
					rateLimitedUntil = Date.now() + 60_000;
				}

				searchHint =
					data && 'error' in data && data.error?.message
						? data.error.message
						: response.status === 404
							? 'Address search is unavailable for this account.'
							: response.status === 429
								? 'Google Places quota exceeded. Wait a minute before searching again.'
								: 'Address search failed. Try again.';
				return;
			}

			suggestions = data && 'suggestions' in data ? (data.suggestions ?? []) : [];
			lastSearchedQuery = trimmed;
			open = suggestions.length > 0;
			searchHint =
				suggestions.length > 0
					? data && 'mock' in data && data.mock
						? 'Demo addresses (no Google API usage).'
						: ''
					: 'No addresses found. Try a different search.';

			if (open) {
				input?.focus();
				await repositionPanel();
			}
		} catch {
			if (requestId === fetchRequestId) {
				suggestions = [];
				open = false;
				searchHint = 'Address search failed. Try again.';
			}
		} finally {
			if (requestId === fetchRequestId) {
				loading = false;
			}
		}
	}

	function runSearch() {
		cancelBlurClose();

		if (Date.now() < rateLimitedUntil) {
			searchHint = 'Google Places quota exceeded. Wait a minute before searching again.';
			return;
		}

		const trimmed = value.trim();

		if (trimmed.length < 3) {
			searchHint = 'Enter at least 3 characters, then click Search.';
			suggestions = [];
			open = false;
			return;
		}

		if (trimmed === lastSearchedQuery && suggestions.length > 0) {
			open = true;
			searchHint = '';
			void repositionPanel();
			return;
		}

		const requestId = ++fetchRequestId;
		void fetchSuggestions(trimmed, requestId);
	}

	function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
		const next = event.currentTarget.value;
		value = next;

		if (next.trim() === lastSearchedQuery) {
			return;
		}

		clearSelection();
		suggestions = [];
		open = false;
		searchHint = '';
	}

	function handleFocus() {
		cancelBlurClose();

		if (value.trim() === lastSearchedQuery && suggestions.length > 0) {
			open = true;
			void repositionPanel();
		}
	}

	async function selectSuggestion(suggestion: AddressSuggestion) {
		cancelBlurClose();
		resolving = true;
		open = false;
		value = suggestion.address;
		fetchRequestId += 1;

		try {
			if (suggestion.lat != null && suggestion.lng != null) {
				lat = suggestion.lat;
				lng = suggestion.lng;
				lastSearchedQuery = value.trim();
				return;
			}

			const response = await fetch('/api/v1/places/resolve', {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ placeId: suggestion.placeId })
			});

			if (!response.ok) {
				clearSelection();
				searchHint = 'Could not resolve that address. Try searching again.';
				return;
			}

			const data = (await response.json()) as { suggestion?: AddressSuggestion };
			if (!data.suggestion) {
				clearSelection();
				searchHint = 'Could not resolve that address. Try searching again.';
				return;
			}

			value = data.suggestion.address;
			lat = data.suggestion.lat ?? null;
			lng = data.suggestion.lng ?? null;
			lastSearchedQuery = value.trim();
		} catch {
			clearSelection();
			searchHint = 'Could not resolve that address. Try searching again.';
		} finally {
			resolving = false;
			suggestions = [];
		}
	}

	function handleResultPointerDown(event: PointerEvent) {
		event.preventDefault();
	}

	let root: HTMLDivElement | undefined = $state();
	let anchor: HTMLDivElement | undefined = $state();
	let input: HTMLInputElement | undefined = $state();
	let panel: HTMLUListElement | undefined = $state();

	$effect(() => {
		if (value.trim() && lat != null && lng != null) {
			lastSearchedQuery = value.trim();
		}
	});

	$effect(() => {
		if (!showDropdown || !anchor || !panel) return;

		const update = () => {
			if (anchor && panel) {
				panelPosition = positionFloatingPanel(anchor, panel);
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

<div bind:this={root} class="relative flex w-full flex-col gap-1.5">
	<label for={id} class="font-inter text-[13px] font-medium text-gray-500 dark:text-slate-400">
		{label}
	</label>

	<div bind:this={anchor} class="flex gap-2">
		<div class="relative min-w-0 flex-1">
			<MapPin
				size={16}
				class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 {pinClass}"
				aria-hidden="true"
			/>
			<input
				bind:this={input}
				{id}
				{name}
				type="text"
				autocomplete="off"
				role="combobox"
				aria-autocomplete="list"
				aria-controls={showDropdown ? listboxId : undefined}
				aria-expanded={showDropdown}
				aria-busy={loading || resolving}
				aria-invalid={error ? 'true' : undefined}
				aria-describedby={describedBy}
				placeholder="Type an address, then click Search"
				{value}
				oninput={handleInput}
				onfocus={handleFocus}
				onblur={scheduleBlurClose}
				class="{createJobFieldInputClass} pl-11 {error ? createJobFieldInputErrorClass : ''}"
			/>
		</div>

		<button
			id={searchButtonId}
			type="button"
			class="font-inter flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
			disabled={!canSearch}
			aria-busy={loading}
			aria-controls={showDropdown ? listboxId : undefined}
			onclick={runSearch}
		>
			<Search size={14} aria-hidden="true" />
			{loading ? 'Searching…' : isRateLimited ? 'Wait…' : 'Search'}
		</button>
	</div>

	{#if searchHint}
		<p id={hintId} class="font-inter text-xs text-gray-500 dark:text-slate-400">{searchHint}</p>
	{/if}

	{#if error}
		<p id={errorId} class={createJobFieldErrorMessageClass}>{error}</p>
	{/if}

	<input type="hidden" name={latName} value={lat ?? ''} />
	<input type="hidden" name={lngName} value={lng ?? ''} />

	{#if showDropdown}
		<ul
			use:portal
			bind:this={panel}
			id={listboxId}
			role="listbox"
			class="fixed z-50 max-h-48 min-w-[280px] overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
			style={floatingPanelStyle(panelPosition)}
			onpointerdown={handleResultPointerDown}
		>
			{#each suggestions as suggestion, index (`${suggestion.placeId}-${index}`)}
				<li role="presentation">
					<button
						type="button"
						role="option"
						aria-selected="false"
						class="font-inter w-full px-3.5 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-50 dark:text-slate-100 dark:hover:bg-slate-800"
						onclick={() => {
							void selectSuggestion(suggestion);
						}}
					>
						{suggestion.address}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
