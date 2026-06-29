<script lang="ts">
	import {
		formatInviteCountdown,
		inviteTimeRemaining
	} from '$lib/utils/driver-invite';

	type Props = {
		expiresAt: string | null;
	};

	let { expiresAt }: Props = $props();

	let remaining = $state(inviteTimeRemaining(null));

	$effect(() => {
		remaining = inviteTimeRemaining(expiresAt);

		const interval = setInterval(() => {
			remaining = inviteTimeRemaining(expiresAt);
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<div class="flex flex-col items-center gap-1">
	<p class="font-inter text-xs text-gray-500 dark:text-slate-400">This link expires in</p>
	<p
		class="font-['DM_Mono',ui-monospace,monospace] text-[13px] font-medium text-gray-900 dark:text-slate-100"
	>
		{remaining.expired ? '00:00:00' : formatInviteCountdown(remaining)}
	</p>
</div>
