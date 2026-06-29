<script lang="ts">
	import { ArrowRight, Building2, UserCheck } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import DriverInviteCountdown from '$lib/components/driver/DriverInviteCountdown.svelte';

	type Props = {
		companyName: string;
		expiresAt: string | null;
		token: string;
		preview?: boolean;
	};

	let { companyName, expiresAt, token, preview = false }: Props = $props();

	const activateHref = $derived(
		preview
			? '/activate?preview=2f'
			: `/activate?token=${encodeURIComponent(token)}&step=install`
	);
</script>

<div
	class="flex w-full max-w-[390px] flex-col items-center rounded-2xl border border-gray-200 bg-gray-50 px-6 py-8 dark:border-slate-700 dark:bg-slate-800"
>
	<div
		class="flex size-[72px] items-center justify-center rounded-full bg-green-100 dark:bg-green-950"
		aria-hidden="true"
	>
		<UserCheck size={32} class="text-brand" stroke-width={1.75} />
	</div>

	<h1
		class="font-syne mt-5 text-center text-[22px] font-bold text-gray-900 dark:text-slate-100"
	>
		You've been invited
	</h1>

	<div class="mt-2 flex items-center gap-1.5">
		<Building2 size={14} class="text-brand" stroke-width={1.75} aria-hidden="true" />
		<p class="font-inter text-[15px] font-semibold text-brand">{companyName}</p>
	</div>

	<p
		class="font-inter mt-4 max-w-[280px] text-center text-sm leading-[22px] text-gray-500 dark:text-slate-400"
	>
		has added you as a driver on Loadr. Tap the button below to activate your account.
	</p>

	<Button
		href={activateHref}
		variant="brand"
		class="mt-7 h-[52px] w-full max-w-[302px] gap-2 rounded-[10px] text-[15px]"
	>
		<ArrowRight size={18} stroke-width={1.75} aria-hidden="true" />
		Activate my account
	</Button>

	<div class="mt-4">
		<DriverInviteCountdown {expiresAt} />
	</div>
</div>

<div class="mt-5 flex flex-col items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
	<p class="font-inter">Didn't expect this invite?</p>
	<a
		href="/"
		class="font-inter font-medium text-gray-500 underline underline-offset-2 dark:text-slate-400"
	>
		Ignore this message
	</a>
</div>
