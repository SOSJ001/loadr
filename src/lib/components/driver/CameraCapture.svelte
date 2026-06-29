<script lang="ts">
	type Props = {
		onCapture?: (dataUrl: string) => void;
	};

	let { onCapture }: Props = $props();

	function handleChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !onCapture) return;

		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === 'string') onCapture(reader.result);
		};
		reader.readAsDataURL(file);
	}
</script>

<label class="block rounded-lg border border-dashed p-6 text-center text-sm text-gray-600">
	<input type="file" accept="image/*" capture="environment" class="hidden" onchange={handleChange} />
	Capture photo
</label>
