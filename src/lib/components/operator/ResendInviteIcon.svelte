<script lang="ts">
	import { Mail } from '@lucide/svelte';

	type Props = {
		size?: number;
		class?: string;
	};

	let { size = 16, class: className = '' }: Props = $props();
</script>

<Mail {size} class={className} aria-hidden="true" stroke-width={1.5} />
