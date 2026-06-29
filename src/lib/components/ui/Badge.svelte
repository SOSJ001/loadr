<script lang="ts">
	type Props = { label: string; tone?: 'default' | 'success' | 'warning' | 'danger' };

	let { label, tone = 'default' }: Props = $props();

	const toneClass = $derived(
		({
			default: 'bg-gray-100 text-gray-800',
			success: 'bg-green-100 text-green-800',
			warning: 'bg-amber-100 text-amber-800',
			danger: 'bg-red-100 text-red-800'
		})[tone]
	);
</script>

<span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {toneClass}">{label}</span>
