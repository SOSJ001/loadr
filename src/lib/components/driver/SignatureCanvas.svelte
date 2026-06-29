<script lang="ts">
	type Props = {
		onSign?: (dataUrl: string) => void;
	};

	let { onSign }: Props = $props();
	let canvas: HTMLCanvasElement | undefined = $state();
	let drawing = $state(false);

	function getPoint(event: PointerEvent) {
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}

	function start(event: PointerEvent) {
		if (!canvas) return;
		drawing = true;
		const ctx = canvas.getContext('2d');
		const { x, y } = getPoint(event);
		ctx?.beginPath();
		ctx?.moveTo(x, y);
	}

	function move(event: PointerEvent) {
		if (!drawing || !canvas) return;
		const ctx = canvas.getContext('2d');
		const { x, y } = getPoint(event);
		ctx?.lineTo(x, y);
		ctx?.stroke();
	}

	function end() {
		drawing = false;
		if (canvas && onSign) onSign(canvas.toDataURL('image/png'));
	}
</script>

<canvas
	bind:this={canvas}
	width="320"
	height="160"
	class="w-full rounded-md border bg-white touch-none"
	onpointerdown={start}
	onpointermove={move}
	onpointerup={end}
	onpointerleave={end}
></canvas>
