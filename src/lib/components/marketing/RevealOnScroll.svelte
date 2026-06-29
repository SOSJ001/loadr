<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		delay?: number;
		when?: 'mount' | 'scroll';
		variant?: 'up' | 'scale';
		class?: string;
		children: Snippet;
	};

	let {
		delay = 0,
		when = 'scroll',
		variant = 'up',
		class: className = '',
		children
	}: Props = $props();

	let visible = $state(false);
	let node = $state<HTMLElement | null>(null);

	const hiddenClass = $derived(
		variant === 'scale'
			? 'opacity-0 scale-[0.96]'
			: 'translate-y-8 opacity-0'
	);

	const shownClass = $derived(
		variant === 'scale' ? 'opacity-100 scale-100' : 'translate-y-0 opacity-100'
	);

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			visible = true;
			return;
		}

		if (when === 'mount') {
			window.setTimeout(() => {
				visible = true;
			}, delay);
			return;
		}

		if (!node) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					visible = true;
					observer.disconnect();
				}
			},
			{ threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
		);

		observer.observe(node);
		return () => observer.disconnect();
	});
</script>

<div
	bind:this={node}
	class="transition-all duration-700 ease-out motion-reduce:translate-none motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none {visible
		? shownClass
		: hiddenClass} {visible ? 'pointer-events-auto' : 'pointer-events-none'} {className}"
	style:transition-delay={when === 'scroll' && visible ? `${delay}ms` : '0ms'}
>
	{@render children()}
</div>
