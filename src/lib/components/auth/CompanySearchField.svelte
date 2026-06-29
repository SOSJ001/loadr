<script lang="ts">
	import { searchMockCompanies } from '$lib/data/mock-companies-house';
	import type { CompanyHouseResult } from '$lib/types/company-search';

	type Props = {
		id?: string;
		name?: string;
		value?: string;
		selected?: CompanyHouseResult | null;
		error?: string;
		required?: boolean;
		dropdownOpen?: boolean;
		oninput?: (event: Event & { currentTarget: HTMLInputElement }) => void;
		onManualEntry?: () => void;
		onSelect?: (company: CompanyHouseResult) => void;
		onClearSelection?: () => void;
	};

	let {
		id,
		name = 'company_search',
		value = $bindable(''),
		selected = $bindable<CompanyHouseResult | null>(null),
		error = '',
		required = false,
		dropdownOpen = $bindable(false),
		oninput,
		onManualEntry,
		onSelect,
		onClearSelection
	}: Props = $props();

	const inputId = $derived(id ?? name);
	const listboxId = $derived(`${inputId}-results`);

	const results = $derived(searchMockCompanies(value));
	const showDropdown = $derived(
		!selected && dropdownOpen && value.trim().length >= 2 && results.length > 0
	);

	const inputClass = $derived(
		error
			? 'border-red-600 focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)] dark:border-red-500 dark:focus:border-red-500 dark:focus:shadow-[0_0_0_3px_rgba(248,113,113,0.2)]'
			: 'border-gray-200 focus:border-brand focus:shadow-[0_0_0_3px_rgba(29,158,117,0.15)] dark:border-slate-700 dark:focus:border-brand dark:focus:shadow-[0_0_0_3px_rgba(29,158,117,0.25)]'
	);

	function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
		selected = null;
		dropdownOpen = true;
		oninput?.(event);
	}

	function handleFocus() {
		if (value.trim().length >= 2 && results.length > 0) {
			dropdownOpen = true;
		}
	}

	function handleBlur() {
		window.setTimeout(() => {
			dropdownOpen = false;
		}, 150);
	}

	function selectCompany(company: CompanyHouseResult) {
		if (company.status === 'dissolved') return;

		selected = company;
		value = company.name;
		dropdownOpen = false;
		onSelect?.(company);
	}

	function handleResultMouseDown(event: MouseEvent) {
		event.preventDefault();
	}

	function clearSelection() {
		selected = null;
		value = '';
		dropdownOpen = false;
		onClearSelection?.();
	}
</script>

<div class="flex w-full flex-col">
	{#if selected}
		<p
			id="{inputId}-label"
			class="mb-1.5 font-inter text-xs font-medium text-gray-500 dark:text-slate-400"
		>
			Find your company
		</p>
		<div
			role="group"
			aria-labelledby="{inputId}-label"
			class="flex h-14 w-full items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-3.5 dark:border-green-800/70 dark:bg-green-950/50"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 18 18"
				fill="none"
				aria-hidden="true"
				class="shrink-0 text-brand"
			>
				<circle cx="9" cy="9" r="7.25" stroke="currentColor" stroke-width="1.5" />
				<path
					d="M5.75 9.25 7.75 11.25 12.25 6.75"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<div class="flex min-w-0 flex-1 flex-col gap-0.5">
				<p class="truncate font-inter text-sm font-semibold text-gray-900 dark:text-slate-100">
					{selected.name}
				</p>
				<p class="font-mono text-[11px] text-gray-500 dark:text-slate-400">{selected.number}</p>
			</div>
			<button
				type="button"
				class="shrink-0 font-inter text-xs font-medium text-brand hover:underline"
				onclick={clearSelection}
			>
				Change
			</button>
		</div>
	{:else}
		<label for={inputId} class="mb-1.5 font-inter text-xs font-medium text-gray-500 dark:text-slate-400">
			Find your company
		</label>
		<div class="relative">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				aria-hidden="true"
				class="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-gray-400 dark:text-slate-500"
			>
				<path
					d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<input
				id={inputId}
				{name}
				type="search"
				placeholder="Search by company name or number..."
				{required}
				autocomplete="off"
				role="combobox"
				aria-expanded={showDropdown}
				aria-controls={listboxId}
				aria-autocomplete="list"
				aria-invalid={error ? 'true' : undefined}
				aria-describedby={error ? `${inputId}-error` : undefined}
				bind:value
				oninput={handleInput}
				onfocus={handleFocus}
				onblur={handleBlur}
				class="font-inter h-12 min-h-12 w-full rounded-lg border bg-white py-0 pr-3.5 pl-10 text-sm text-gray-900 outline-none transition-[border-color,box-shadow] placeholder:text-gray-300 focus:border-2 focus:ring-0 sm:h-11 sm:min-h-11 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 {inputClass}"
			/>

			{#if showDropdown}
				<ul
					id={listboxId}
					role="listbox"
					class="absolute top-[calc(100%+6px)] z-20 max-h-[156px] w-full overflow-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
				>
					{#each results as company (company.number)}
						<li role="presentation">
							<button
								type="button"
								role="option"
								aria-selected="false"
								disabled={company.status === 'dissolved'}
								class="flex h-[52px] w-full flex-col justify-center gap-0.5 px-3.5 py-2 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:hover:bg-slate-700/60 dark:disabled:hover:bg-transparent {company.status ===
								'dissolved'
									? 'opacity-60'
									: ''}"
								onmousedown={handleResultMouseDown}
								onclick={() => selectCompany(company)}
							>
								<span
									class="truncate font-inter text-sm font-semibold text-gray-900 dark:text-slate-100"
								>
									{company.name}
								</span>
								<span class="flex items-center gap-1.5">
									<span class="font-mono text-[11px] text-gray-500 dark:text-slate-400">
										{company.number}
									</span>
									<span class="text-[11px] text-gray-500 dark:text-slate-500" aria-hidden="true"
										>·</span
									>
									{#if company.status === 'active'}
										<span
											class="rounded-full bg-green-100 px-2 py-0.5 font-inter text-[10px] font-medium text-green-600 dark:bg-green-950 dark:text-green-400"
										>
											Active
										</span>
									{:else}
										<span
											class="rounded-full bg-red-100 px-2 py-0.5 font-inter text-[10px] font-medium text-red-600 dark:bg-red-950 dark:text-red-400"
										>
											Dissolved
										</span>
									{/if}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}

	<button
		type="button"
		class="mt-2 self-start font-inter text-xs font-medium text-brand hover:underline"
		onclick={() => onManualEntry?.()}
	>
		My company isn't listed
	</button>
	{#if error}
		<p id="{inputId}-error" class="mt-1.5 font-inter text-xs text-red-600 dark:text-red-500">{error}</p>
	{/if}
</div>
