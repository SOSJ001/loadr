<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { CircleHelp, Briefcase, User, LogOut } from '@lucide/svelte';
	import { logout } from '$lib/auth/logout';
	import { isDriverJobsPreviewMode } from '$lib/utils/driver-jobs-theme';

	type Tab = 'jobs' | 'profile' | 'help';

	type Props = {
		active?: Tab;
	};

	let { active = 'jobs' }: Props = $props();

	const pathname = $derived(page.url.pathname);

	const currentTab = $derived<Tab>(
		active ||
			(pathname.startsWith('/profile')
				? 'profile'
				: pathname.startsWith('/help')
					? 'help'
					: 'jobs')
	);

	const tabs = [
		{ id: 'jobs' as const, label: 'Jobs', href: '/jobs', Icon: Briefcase },
		{ id: 'profile' as const, label: 'Profile', href: '/profile', Icon: User },
		{ id: 'help' as const, label: 'Help', href: '/help', Icon: CircleHelp }
	];

	const inactiveClass = 'text-gray-500 dark:text-slate-400';
	const isPreview = $derived(isDriverJobsPreviewMode(page.url.searchParams.get('preview')));

	let loggingOut = $state(false);

	async function handleLogout() {
		if (loggingOut) return;
		loggingOut = true;

		if (isPreview) {
			await goto('/login/driver', { invalidateAll: true });
			return;
		}

		try {
			await logout('/login/driver');
		} catch {
			loggingOut = false;
		}
	}
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-gray-50 pb-[34px] dark:border-slate-700 dark:bg-slate-800"
>
	<div class="mx-auto flex h-[49px] max-w-[390px] items-center gap-3 px-5">
		{#each tabs as tab (tab.id)}
			{@const isActive = currentTab === tab.id}
			<a
				href={tab.href}
				class="flex min-w-0 flex-1 flex-col items-center gap-0.5"
				aria-current={isActive ? 'page' : undefined}
			>
				{#if isActive}
					<span class="size-1 rounded-sm bg-brand" aria-hidden="true"></span>
				{:else}
					<span class="size-1" aria-hidden="true"></span>
				{/if}
				<tab.Icon
					size={24}
					stroke-width={1.75}
					class={isActive ? 'text-brand' : inactiveClass}
					aria-hidden="true"
				/>
				<span class="font-inter text-[11px] font-medium {isActive ? 'text-brand' : inactiveClass}">
					{tab.label}
				</span>
			</a>
		{/each}

		<button
			type="button"
			class="flex min-w-0 flex-1 flex-col items-center gap-0.5 disabled:opacity-60"
			aria-label="Log out"
			disabled={loggingOut}
			onclick={handleLogout}
		>
			<span class="size-1" aria-hidden="true"></span>
			<LogOut size={24} stroke-width={1.75} class={inactiveClass} aria-hidden="true" />
			<span class="font-inter text-[11px] font-medium {inactiveClass}">Log out</span>
		</button>
	</div>
</nav>
