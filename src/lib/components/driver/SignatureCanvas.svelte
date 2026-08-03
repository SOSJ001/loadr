<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		onChange?: (hasInk: boolean) => void;
	};

	let { onChange }: Props = $props();

	let canvas = $state<HTMLCanvasElement | null>(null);
	let container = $state<HTMLDivElement | null>(null);
	let drawing = $state(false);
	let hasInk = $state(false);

	let lastPoint: { x: number; y: number } | null = null;
	let currentPoint: { x: number; y: number } | null = null;

	const STROKE_WIDTH = 2;

	function notifyChange(ink: boolean) {
		if (ink !== hasInk) {
			hasInk = ink;
			onChange?.(ink);
		}
	}

	function getContext() {
		return canvas?.getContext('2d') ?? null;
	}

	function getPoint(event: PointerEvent) {
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}

	function fillBackground(ctx: CanvasRenderingContext2D) {
		if (!container) return;
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, container.clientWidth, container.clientHeight);
	}

	function configureStroke(ctx: CanvasRenderingContext2D) {
		ctx.strokeStyle = '#111827';
		ctx.lineWidth = STROKE_WIDTH;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
	}

	function resizeCanvas() {
		if (!canvas || !container) return;

		const dpr = window.devicePixelRatio || 1;
		const width = container.clientWidth;
		const height = container.clientHeight;

		canvas.width = Math.floor(width * dpr);
		canvas.height = Math.floor(height * dpr);
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;

		const ctx = getContext();
		if (!ctx) return;

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(dpr, dpr);
		fillBackground(ctx);
		configureStroke(ctx);

		if (hasInk) {
			notifyChange(false);
		}
		lastPoint = null;
		currentPoint = null;
	}

	function drawSegment(from: { x: number; y: number }, to: { x: number; y: number }) {
		const ctx = getContext();
		if (!ctx) return;

		const midX = (from.x + to.x) / 2;
		const midY = (from.y + to.y) / 2;

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.quadraticCurveTo(from.x, from.y, midX, midY);
		ctx.stroke();
	}

	function start(event: PointerEvent) {
		if (!canvas) return;
		event.preventDefault();
		canvas.setPointerCapture(event.pointerId);
		drawing = true;
		const point = getPoint(event);
		lastPoint = point;
		currentPoint = point;
		notifyChange(true);
	}

	function move(event: PointerEvent) {
		if (!drawing || !canvas) return;
		event.preventDefault();

		const point = getPoint(event);
		if (lastPoint && currentPoint) {
			drawSegment(lastPoint, point);
		}
		lastPoint = currentPoint;
		currentPoint = point;
	}

	function end(event: PointerEvent) {
		if (!drawing || !canvas) return;
		event.preventDefault();
		drawing = false;
		if (canvas.hasPointerCapture(event.pointerId)) {
			canvas.releasePointerCapture(event.pointerId);
		}
		lastPoint = null;
		currentPoint = null;
	}

	export function clear() {
		const ctx = getContext();
		if (!ctx || !canvas || !container) return;

		const width = container.clientWidth;
		const height = container.clientHeight;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		const dpr = window.devicePixelRatio || 1;
		ctx.scale(dpr, dpr);
		ctx.clearRect(0, 0, width, height);
		fillBackground(ctx);
		configureStroke(ctx);
		lastPoint = null;
		currentPoint = null;
		notifyChange(false);
	}

	export async function toBlob(): Promise<Blob | null> {
		if (!canvas || !hasInk) return null;

		return new Promise((resolve) => {
			canvas!.toBlob((blob) => resolve(blob), 'image/png');
		});
	}

	export function getHasInk() {
		return hasInk;
	}

	onMount(() => {
		resizeCanvas();
		const observer = new ResizeObserver(() => resizeCanvas());
		if (container) observer.observe(container);
		return () => observer.disconnect();
	});
</script>

<div
	bind:this={container}
	class="relative h-[220px] w-full overflow-hidden rounded-[14px] border-2 border-dashed border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
>
	<canvas
		bind:this={canvas}
		class="absolute inset-0 touch-none"
		onpointerdown={start}
		onpointermove={move}
		onpointerup={end}
		onpointercancel={end}
	></canvas>
	{#if !hasInk}
		<p
			class="pointer-events-none absolute inset-0 flex items-center justify-center font-inter text-sm text-gray-400 dark:text-slate-500"
		>
			Sign here with your finger
		</p>
	{/if}
</div>
