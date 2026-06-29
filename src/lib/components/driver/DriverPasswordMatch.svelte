<script lang="ts">
	import { Check } from '@lucide/svelte';

	type Props = {
		password: string;
		confirmPassword: string;
	};

	let { password, confirmPassword }: Props = $props();

	const showMatch = $derived(confirmPassword.length > 0 && password === confirmPassword);
</script>

{#if showMatch}
	<div class="flex items-center gap-1.5">
		<Check size={14} class="text-green-600 dark:text-green-500" stroke-width={2} aria-hidden="true" />
		<p class="font-inter text-xs font-medium text-green-600 dark:text-green-500">Passwords match</p>
	</div>
{/if}
