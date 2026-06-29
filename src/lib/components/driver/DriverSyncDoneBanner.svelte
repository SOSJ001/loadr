<script lang="ts">
	import { CircleCheck } from '@lucide/svelte';

	type Props = {
		visible?: boolean;
		autoDismissMs?: number;
		onDismiss?: () => void;
	};

	let { visible = false, autoDismissMs = 3000, onDismiss }: Props = $props();

	$effect(() => {
		if (!visible || autoDismissMs <= 0 || !onDismiss) return;

		const timeout = window.setTimeout(onDismiss, autoDismissMs);
		return () => window.clearTimeout(timeout);
	});
</script>

{#if visible}
	<div
		class="flex h-12 shrink-0 items-center justify-between bg-green-600 px-4"
		role="status"
		aria-live="polite"
	>
		<div class="flex min-w-0 flex-1 items-center gap-2">
			<CircleCheck size={16} class="shrink-0 text-white" stroke-width={2.5} aria-hidden="true" />
			<p class="font-inter min-w-0 truncate text-[13px] text-white">
				<span class="font-bold">All synced</span>
				<span class="font-normal opacity-80"> · you're good to go</span>
			</p>
		</div>
		<CircleCheck size={16} class="shrink-0 text-white" stroke-width={2.5} aria-hidden="true" />
	</div>
{/if}
