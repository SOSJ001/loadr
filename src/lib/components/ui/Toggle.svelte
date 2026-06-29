<script lang="ts">
	type Props = {
		checked?: boolean;
		label: string;
	};

	let { checked = $bindable(false), label }: Props = $props();
</script>

<label class="inline-flex items-center gap-2 text-sm">
	<input type="checkbox" bind:checked class="rounded border-gray-300" />
	<span>{label}</span>
</label>
