<script lang="ts">
	type Props = {
		visible: boolean;
		durationMs: number;
		onCancel: () => void;
	};

	let { visible, durationMs, onCancel }: Props = $props();
</script>

{#if visible}
	<button
		type="button"
		class="font-inter fixed inset-x-5 bottom-[calc(158px+12px)] z-40 mx-auto flex w-full max-w-[350px] flex-col gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2 pt-2 pb-0 text-left dark:border-slate-700 dark:bg-slate-900"
		aria-live="polite"
		onclick={onCancel}
	>
		<p class="text-center text-[11px] text-slate-400">Opening Maps automatically...</p>
		<div class="h-[3px] w-full overflow-hidden rounded-sm bg-slate-800" aria-hidden="true">
			<div
				class="driver-job-started-auto-progress h-full bg-brand"
				style={`animation-duration: ${durationMs}ms`}
			></div>
		</div>
		<span class="sr-only">Tap to cancel automatic directions</span>
	</button>
{/if}

<style>
	@keyframes driver-job-started-auto-progress {
		from {
			transform: scaleX(1);
		}
		to {
			transform: scaleX(0);
		}
	}

	.driver-job-started-auto-progress {
		transform-origin: left center;
		animation: driver-job-started-auto-progress linear forwards;
	}

	@media (prefers-reduced-motion: reduce) {
		.driver-job-started-auto-progress {
			animation: none;
		}
	}
</style>
