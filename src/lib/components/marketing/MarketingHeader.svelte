<script lang="ts">
	import { page } from '$app/state';
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import LoadrLogo from '$lib/components/auth/LoadrLogo.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let menuOpen = $state(false);
	let headerEl = $state<HTMLElement | undefined>();

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

	$effect(() => {
		page.url.pathname;
		menuOpen = false;
	});

	$effect(() => {
		if (!menuOpen || !headerEl) return;

		function onPointerDown(event: PointerEvent) {
			if (!headerEl?.contains(event.target as Node)) {
				closeMenu();
			}
		}

		document.addEventListener('pointerdown', onPointerDown);
		return () => document.removeEventListener('pointerdown', onPointerDown);
	});
</script>

<header
	bind:this={headerEl}
	class="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
>
	<div
		class="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 lg:h-[72px] lg:px-8"
	>
		<LoadrLogo />

		<nav class="hidden items-center gap-8 lg:flex">
			<a
				href="/pricing"
				class="font-inter text-[15px] font-medium text-gray-900 hover:text-brand dark:text-slate-100"
			>
				Pricing
			</a>
			<a
				href="/login"
				class="font-inter text-[15px] font-medium text-gray-900 hover:text-brand dark:text-slate-100"
			>
				Operator log in
			</a>
			<a
				href="/login/driver"
				class="font-inter text-[15px] font-medium text-gray-900 hover:text-brand dark:text-slate-100"
			>
				Driver log in
			</a>

			<ThemeToggle />

			<Button href="/signup" variant="brand" class="h-10 px-[18px]">Sign up free</Button>
		</nav>

		<div class="flex items-center gap-2 lg:hidden">
			<ThemeToggle />
			<button
				type="button"
				class="menu-toggle flex size-10 cursor-pointer items-center justify-center rounded-lg text-gray-900 dark:text-slate-100"
				data-open={menuOpen}
				aria-expanded={menuOpen}
				aria-controls="mobile-nav"
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				onclick={toggleMenu}
			>
				<span class="bar bar-top" aria-hidden="true"></span>
				<span class="bar bar-mid" aria-hidden="true"></span>
				<span class="bar bar-bot" aria-hidden="true"></span>
			</button>
		</div>
	</div>

	{#if menuOpen}
		<div
			id="mobile-nav"
			class="overflow-hidden border-t border-gray-200 bg-white px-5 lg:hidden dark:border-slate-700 dark:bg-slate-900"
			transition:slide={{ duration: 300, easing: quintOut, axis: 'y' }}
		>
			<nav class="flex flex-col gap-4 py-4">
				<a
					href="/pricing"
					class="font-inter text-[15px] font-medium text-gray-900 dark:text-slate-100"
					onclick={closeMenu}
				>
					Pricing
				</a>
				<a
					href="/login"
					class="font-inter text-[15px] font-medium text-gray-900 dark:text-slate-100"
					onclick={closeMenu}
				>
					Operator log in
				</a>
				<a
					href="/login/driver"
					class="font-inter text-[15px] font-medium text-gray-900 dark:text-slate-100"
					onclick={closeMenu}
				>
					Driver log in
				</a>
				<div class="h-px bg-gray-200 dark:bg-slate-700"></div>
				<Button
					href="/signup"
					variant="brand"
					class="h-[52px] w-full rounded-[10px] text-base"
					onclick={closeMenu}
				>
					Sign up free
				</Button>
			</nav>
		</div>
	{/if}
</header>

<style>
	.menu-toggle {
		position: relative;
	}

	.bar {
		position: absolute;
		left: 50%;
		width: 1.25rem;
		height: 1.5px;
		margin-left: -0.625rem;
		border-radius: 9999px;
		background-color: currentColor;
		transition:
			transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1),
			opacity 0.2s ease,
			top 0.3s cubic-bezier(0.34, 1.2, 0.64, 1),
			bottom 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
	}

	.bar-top {
		top: 0.6875rem;
	}

	.bar-mid {
		top: 50%;
		margin-top: -0.75px;
	}

	.bar-bot {
		bottom: 0.6875rem;
	}

	.menu-toggle[data-open='true'] .bar-top {
		top: 50%;
		transform: translateY(-50%) rotate(45deg);
	}

	.menu-toggle[data-open='true'] .bar-mid {
		opacity: 0;
		transform: scaleX(0);
	}

	.menu-toggle[data-open='true'] .bar-bot {
		bottom: auto;
		top: 50%;
		transform: translateY(-50%) rotate(-45deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.bar {
			transition-duration: 0.01ms;
		}
	}
</style>
