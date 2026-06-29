<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	type TocItem = {
		id: string;
		label: string;
	};

	type Props = {
		items: TocItem[];
		activeId?: string | null;
	};

	let { items, activeId = null }: Props = $props();

	let open = $state(false);
	let rootEl = $state<HTMLElement | undefined>();

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
	}

	$effect(() => {
		if (!open || !rootEl) return;

		function onPointerDown(event: PointerEvent) {
			if (!rootEl?.contains(event.target as Node)) {
				close();
			}
		}

		document.addEventListener('pointerdown', onPointerDown);
		return () => document.removeEventListener('pointerdown', onPointerDown);
	});
</script>

<div bind:this={rootEl} class="relative w-full lg:hidden">
	<button
		type="button"
		class="flex h-12 w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-left dark:border-slate-700 dark:bg-slate-800"
		aria-expanded={open}
		aria-haspopup="listbox"
		onclick={toggle}
	>
		<span class="font-inter text-sm font-medium text-gray-900 dark:text-slate-100">
			Jump to section
		</span>
		<svg
			class="size-[18px] shrink-0 text-gray-500 transition-transform duration-300 ease-out motion-reduce:transition-none dark:text-slate-400 {open
				? 'rotate-180'
				: ''}"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="m6 9 6 6 6-6"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	{#if open}
		<ul
			class="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
			role="listbox"
			transition:slide={{ duration: 250, easing: quintOut, axis: 'y' }}
		>
			{#each items as item (item.id)}
				<li>
					<a
						href="#{item.id}"
						class="block px-4 py-2.5 font-inter text-sm transition-colors {activeId === item.id
							? 'font-medium text-brand'
							: 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700'}"
						role="option"
						aria-selected={activeId === item.id}
						onclick={close}
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
