<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import LoadrLogo from '$lib/components/auth/LoadrLogo.svelte';
	import { logout } from '$lib/auth/logout';
	import type { UserProfile } from '$lib/types/user';

	type NavId =
		| 'dashboard'
		| 'jobs'
		| 'drivers'
		| 'vehicles'
		| 'analytics'
		| 'invoices'
		| 'settings';

	type Props = {
		children: Snippet;
		profile?: UserProfile | null;
		companyName?: string;
		plan?: string;
	};

	let { children, profile = null, companyName = 'Your company', plan = 'free' }: Props = $props();

	const activeNav = $derived.by((): NavId | null => {
		const path = page.url.pathname;
		if (path.startsWith('/dashboard')) return 'dashboard';
		if (path.startsWith('/jobs')) return 'jobs';
		if (path.startsWith('/drivers')) return 'drivers';
		if (path.startsWith('/vehicles')) return 'vehicles';
		if (path.startsWith('/analytics')) return 'analytics';
		if (path.startsWith('/invoices')) return 'invoices';
		if (path.startsWith('/settings')) return 'settings';
		return null;
	});

	const initials = $derived(
		companyName
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((word) => word[0]?.toUpperCase() ?? '')
			.join('') || 'LC'
	);

	const planLabel = $derived(
		plan === 'free' ? 'Free plan' : plan.charAt(0).toUpperCase() + plan.slice(1)
	);

	type NavItem = {
		id: NavId;
		label: string;
		href: string;
		locked?: boolean;
	};

	const navItems: NavItem[] = [
		{ id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
		{ id: 'jobs', label: 'Jobs', href: '/jobs' },
		{ id: 'drivers', label: 'Drivers', href: '/drivers' },
		{ id: 'vehicles', label: 'Vehicles', href: '/vehicles', locked: true },
		{ id: 'analytics', label: 'Analytics', href: '/analytics', locked: true },
		{ id: 'invoices', label: 'Invoices', href: '/invoices', locked: true }
	];

	const navBase =
		'flex h-11 w-full items-center gap-3 rounded-lg px-4 text-sm font-medium transition-colors';

	const logoutNavClass = `${navBase} text-gray-500 hover:bg-gray-200/70 hover:text-gray-900 disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100`;

	let loggingOut = $state(false);

	async function handleLogout() {
		if (loggingOut) return;
		loggingOut = true;
		try {
			await logout();
		} catch {
			loggingOut = false;
		}
	}

	function navClass(id: NavId, locked?: boolean) {
		const active = activeNav === id;
		if (locked) {
			return `${navBase} justify-between text-gray-300 dark:text-slate-600`;
		}
		if (active) {
			return `${navBase} border border-brand bg-green-100 text-brand dark:border-brand dark:bg-green-950 dark:text-brand`;
		}
		return `${navBase} text-gray-500 hover:bg-gray-200/70 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100`;
	}
</script>

<div class="flex h-dvh overflow-hidden bg-gray-50 dark:bg-slate-900">
	<aside
		class="flex h-full w-60 shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-gray-100 px-3 pt-6 pb-4 dark:border-slate-700 dark:bg-slate-900"
	>
		<div class="pl-2">
			<LoadrLogo href="/dashboard" class="text-xl" />
		</div>

		<nav class="mt-8 flex flex-col gap-1" aria-label="Operator navigation">
			{#each navItems as item (item.id)}
				{#if item.locked}
					<span class={navClass(item.id, true)} aria-disabled="true">
						<span class="flex items-center gap-3">
							<span class="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
								{#if item.id === 'vehicles'}
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
										<circle cx="4.5" cy="11.5" r="1" fill="currentColor" />
										<circle cx="11.5" cy="11.5" r="1" fill="currentColor" />
									</svg>
								{:else if item.id === 'analytics'}
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
										<path
											d="M2.5 12.5V7.5M6 12.5V4.5M9.5 12.5V8.5M13.5 12.5V2.5"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
										/>
									</svg>
								{:else}
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
										<path
											d="M4.5 3.5h7a1 1 0 0 1 1 1v8H3.5v-8a1 1 0 0 1 1-1Z"
											stroke="currentColor"
											stroke-width="1.5"
										/>
										<path
											d="M6 7h4M6 9.5h4"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
										/>
									</svg>
								{/if}
							</span>
							{item.label}
						</span>
						<svg
							width="12"
							height="12"
							viewBox="0 0 12 12"
							fill="none"
							class="shrink-0"
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
					</span>
				{:else}
					<a
						href={item.href}
						class={navClass(item.id)}
						aria-current={activeNav === item.id ? 'page' : undefined}
					>
						<span class="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
							{#if item.id === 'dashboard'}
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<rect
										x="2"
										y="2"
										width="5"
										height="5"
										rx="1"
										stroke="currentColor"
										stroke-width="1.5"
									/>
									<rect
										x="9"
										y="2"
										width="5"
										height="5"
										rx="1"
										stroke="currentColor"
										stroke-width="1.5"
									/>
									<rect
										x="2"
										y="9"
										width="5"
										height="5"
										rx="1"
										stroke="currentColor"
										stroke-width="1.5"
									/>
									<rect
										x="9"
										y="9"
										width="5"
										height="5"
										rx="1"
										stroke="currentColor"
										stroke-width="1.5"
									/>
								</svg>
							{:else if item.id === 'jobs'}
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path
										d="M5 3.5h6a1 1 0 0 1 1 1v8.5H4V4.5a1 1 0 0 1 1-1Z"
										stroke="currentColor"
										stroke-width="1.5"
									/>
									<path
										d="M6 6.5h4M6 9h4"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
									/>
								</svg>
							{:else}
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<circle cx="8" cy="5.5" r="2" stroke="currentColor" stroke-width="1.5" />
									<path
										d="M3.5 13.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
									/>
								</svg>
							{/if}
						</span>
						{item.label}
					</a>
				{/if}
			{/each}

			<div class="h-3" aria-hidden="true"></div>
			<div class="h-px bg-gray-200 dark:bg-slate-700"></div>
			<div class="h-3" aria-hidden="true"></div>

			<a
				href="/settings"
				class={navClass('settings')}
				aria-current={activeNav === 'settings' ? 'page' : undefined}
			>
				<span class="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5" />
						<path
							d="M8 2.5v1.25M8 12.25V13.5M2.5 8h1.25M12.25 8H13.5M4.05 4.05l.88.88M10.98 10.98l.88.88M11.95 4.05l-.88.88M5.02 10.98l-.88.88"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
					</svg>
				</span>
				Settings
			</a>

			<button type="button" class={logoutNavClass} disabled={loggingOut} onclick={handleLogout}>
				<span class="flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path
							d="M6 4H4.5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1H6M10.5 11.5 13 8.5 10.5 5.5M13 8.5H6.5"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</span>
				{loggingOut ? 'Logging out…' : 'Log out'}
			</button>
		</nav>

		<div class="flex-1" aria-hidden="true"></div>

		<div class="flex items-center gap-2.5 px-4 py-3">
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-brand font-inter text-[13px] font-semibold text-white"
				aria-hidden="true"
			>
				{initials}
			</div>
			<div class="min-w-0">
				<p class="truncate font-inter text-[13px] font-medium text-gray-900 dark:text-slate-100">
					{companyName}
				</p>
				<span
					class="font-inter mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
				>
					{planLabel}
				</span>
			</div>
		</div>
	</aside>

	<div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900">
		<main class="flex min-h-0 flex-1 flex-col overflow-hidden">
			<div class="flex min-h-0 flex-1 flex-col overflow-hidden">
				{@render children()}
			</div>
		</main>
	</div>
</div>
