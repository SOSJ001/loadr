<script lang="ts">
	import { page } from '$app/state';
	import { logout } from '$lib/auth/logout';
	import Button from '$lib/components/ui/Button.svelte';

	type Props = {
		email?: string | null;
		companyName?: string;
	};

	let { email = '', companyName = 'Your company' }: Props = $props();

	let copied = $state(false);
	let loggingOut = $state(false);

	const initials = $derived(
		companyName
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((word) => word[0]?.toUpperCase() ?? '')
			.join('') || 'LC'
	);

	const dashboardUrl = $derived(`${page.url.origin}/dashboard`);

	const features = [
		'Create and assign jobs',
		'Invite and manage drivers',
		'Track deliveries in real time'
	];

	async function copyDashboardLink() {
		try {
			await navigator.clipboard.writeText(dashboardUrl);
			copied = true;
			window.setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// Clipboard may be unavailable in insecure contexts.
		}
	}

	async function handleLogout() {
		if (loggingOut) return;
		loggingOut = true;
		try {
			await logout();
		} catch {
			loggingOut = false;
		}
	}
</script>

<div
	class="flex min-h-dvh flex-col items-center justify-center overflow-y-auto bg-white px-5 py-4 dark:bg-slate-900"
>
	<div
		class="my-auto flex w-full max-w-[350px] flex-col gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-5 pt-4 pb-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
	>
		<div class="flex h-9 w-full items-center">
			<a href="/dashboard" class="font-syne text-[22px] font-bold leading-none">
				<span class="text-gray-900 dark:text-slate-100">load</span><span class="text-brand">r</span>
			</a>
			<div class="flex-1" aria-hidden="true"></div>
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-green-100 font-inter text-[11px] font-semibold text-green-600 dark:bg-green-900 dark:text-green-600"
				aria-hidden="true"
			>
				{initials}
			</div>
		</div>

		<p class="font-inter text-center text-xs font-medium text-gray-500 dark:text-slate-400">
			Operator Portal
		</p>

		<div class="flex h-20 items-center justify-center gap-4" aria-hidden="true">
			<div
				class="flex size-12 items-center justify-center rounded-3xl border-[1.5px] border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800"
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					class="text-gray-500 dark:text-slate-400"
				>
					<rect
						x="7"
						y="3"
						width="10"
						height="18"
						rx="2"
						stroke="currentColor"
						stroke-width="1.5"
					/>
					<path d="M10 18h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</div>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				class="text-gray-400 dark:text-slate-500"
			>
				<path
					d="M6 4l4 4-4 4"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<div
				class="flex size-20 items-center justify-center rounded-[40px] bg-green-100 dark:bg-green-900"
			>
				<svg width="36" height="36" viewBox="0 0 36 36" fill="none" class="text-brand">
					<rect
						x="5"
						y="5"
						width="11"
						height="11"
						rx="2"
						stroke="currentColor"
						stroke-width="1.75"
					/>
					<rect
						x="20"
						y="5"
						width="11"
						height="11"
						rx="2"
						stroke="currentColor"
						stroke-width="1.75"
					/>
					<rect
						x="5"
						y="20"
						width="11"
						height="11"
						rx="2"
						stroke="currentColor"
						stroke-width="1.75"
					/>
					<rect
						x="20"
						y="20"
						width="11"
						height="11"
						rx="2"
						stroke="currentColor"
						stroke-width="1.75"
					/>
				</svg>
			</div>
		</div>

		<h1 class="font-inter text-center text-[22px] font-semibold text-gray-900 dark:text-slate-100">
			Switch to desktop
		</h1>
		<p class="font-inter text-center text-sm text-brand">You are signed in, one more step</p>
		<p class="font-inter text-center text-sm leading-[22px] text-gray-500 dark:text-slate-400">
			The operator dashboard is not available on mobile. Open Loadr on a laptop or desktop to
			manage your business.
		</p>

		{#if email}
			<div class="flex justify-center">
				<div
					class="rounded-full bg-gray-100 px-3 py-2 dark:bg-slate-900"
				>
					<p class="font-mono text-xs text-gray-900 dark:text-slate-100">{email}</p>
				</div>
			</div>
		{/if}

		<ul class="flex w-full flex-col gap-2">
			{#each features as feature (feature)}
				<li class="flex items-center gap-2.5">
					<span class="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true"></span>
					<span class="font-inter text-[13px] text-gray-500 dark:text-slate-400">{feature}</span>
				</li>
			{/each}
		</ul>

		<Button
			type="button"
			variant="brand"
			size="auth"
			class="w-full gap-2 font-inter text-[15px] font-semibold"
			onclick={copyDashboardLink}
		>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<rect
					x="5.5"
					y="5.5"
					width="8"
					height="8"
					rx="1"
					stroke="currentColor"
					stroke-width="1.5"
				/>
				<path
					d="M5.5 10.5V4.5a1 1 0 0 1 1-1h6"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
			{copied ? 'Link copied!' : 'Copy dashboard link'}
		</Button>

		<p class="font-inter text-center text-xs text-gray-300 dark:text-slate-600">
			Paste the link into your desktop browser, or email it to yourself.
		</p>

		<button
			type="button"
			class="font-inter text-center text-sm font-medium text-brand transition-colors hover:text-[#178566] disabled:opacity-60"
			disabled={loggingOut}
			onclick={handleLogout}
		>
			{loggingOut ? 'Logging out…' : 'Log out'}
		</button>
	</div>
</div>
