<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	type Props = {
		name: string;
		status: 'pending' | 'active';
		phone?: string | null;
	};

	let { name, status, phone }: Props = $props();
</script>

<Card title={name}>
	<p class="text-sm text-gray-600">{phone ?? 'No phone'}</p>
	<div class="mt-2"><Badge label={status} tone={status === 'active' ? 'success' : 'warning'} /></div>
</Card>
