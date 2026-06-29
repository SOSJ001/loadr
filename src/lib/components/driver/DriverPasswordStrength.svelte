<script lang="ts">
	type Props = {
		password: string;
	};

	let { password }: Props = $props();

	type Strength = {
		label: string;
		percent: number;
		fillClass: string;
		labelClass: string;
	};

	function scorePassword(value: string): Strength | null {
		if (!value) return null;

		let score = 0;
		if (value.length >= 8) score++;
		if (value.length >= 12) score++;
		if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
		if (/\d/.test(value)) score++;
		if (/[^a-zA-Z0-9]/.test(value)) score++;

		if (score <= 2) {
			return {
				label: 'Weak',
				percent: 33,
				fillClass: 'bg-red-500',
				labelClass: 'text-red-500'
			};
		}
		if (score === 3) {
			return {
				label: 'Fair',
				percent: 66,
				fillClass: 'bg-amber-500',
				labelClass: 'text-amber-600 dark:text-amber-500'
			};
		}
		if (score === 4) {
			return {
				label: 'Good',
				percent: 85,
				fillClass: 'bg-brand',
				labelClass: 'text-brand'
			};
		}
		return {
			label: 'Strong',
			percent: 100,
			fillClass: 'bg-brand',
			labelClass: 'text-brand'
		};
	}

	const strength = $derived(scorePassword(password));
</script>

{#if strength}
	<div class="flex w-full flex-col gap-1">
		<div class="h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-600">
			<div
				class="h-full rounded-full transition-[width] duration-200 {strength.fillClass}"
				style="width: {strength.percent}%"
			></div>
		</div>
		<p
			class="font-inter text-right text-[11px] font-medium {strength.labelClass}"
			aria-live="polite"
		>
			{strength.label}
		</p>
	</div>
{/if}
