<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';

	type Props = { status: string };

	let { status }: Props = $props();

	const tone = $derived(
		status === 'complete'
			? 'success'
			: status === 'attempted'
				? 'warning'
				: 'default'
	);
</script>

<Badge label={status} {tone} />
