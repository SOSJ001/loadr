<script lang="ts">
	import { Bell } from '@lucide/svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	type Props = {
		greeting: string;
		driverFirstName: string;
		hasUnreadNotifications?: boolean;
	};

	let { greeting, driverFirstName, hasUnreadNotifications = false }: Props = $props();
</script>

<header class="flex h-[60px] items-center justify-between px-5">
	<div class="flex flex-col gap-0.5">
		<p class="font-inter text-sm text-gray-500 dark:text-slate-400">{greeting}</p>
		<h1 class="font-syne text-[22px] font-bold text-gray-900 dark:text-slate-100">
			{driverFirstName}
		</h1>
	</div>

	<div class="flex h-11 items-center gap-2">
		<div class="flex size-11 items-center justify-center">
			<ThemeToggle />
		</div>

		<button
			type="button"
			class="relative flex size-11 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-slate-800"
			aria-label="Notifications"
		>
			<Bell size={24} stroke-width={1.75} aria-hidden="true" />
			{#if hasUnreadNotifications}
				<span
					class="absolute top-1.5 left-7 size-2 rounded bg-red-600"
					aria-hidden="true"
				></span>
			{/if}
		</button>
	</div>
</header>
