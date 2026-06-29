<script lang="ts">
	import { Copy } from '@lucide/svelte';

	type Props = {
		size?: number;
		class?: string;
	};

	let { size = 12, class: className = '' }: Props = $props();
</script>

<Copy {size} class={className} aria-hidden="true" stroke-width={1.5} />
