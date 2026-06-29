<script lang="ts">
	type Props = { message: string; tone?: 'info' | 'success' | 'error' };

	let { message, tone = 'info' }: Props = $props();
</script>

<div
	class="rounded-md border px-3 py-2 text-sm {tone === 'error'
		? 'border-red-200 bg-red-50 text-red-800'
		: tone === 'success'
			? 'border-green-200 bg-green-50 text-green-800'
			: 'border-blue-200 bg-blue-50 text-blue-800'}"
	role="status"
>
	{message}
</div>
