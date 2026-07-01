<script lang="ts">
	type Rounded = 'xs' | 'sm' | 'md' | 'lg' | 'full';

	type Props = {
		class?: string;
		rounded?: Rounded;
		/** Brand-tinted block (e.g. New Job / avatar) — static, no shimmer sweep. */
		brand?: boolean;
		/** Shimmer stagger delay in ms (0–150 per Figma). */
		delay?: number;
	};

	let { class: className = '', rounded = 'sm', brand = false, delay }: Props = $props();

	const roundedClass: Record<Rounded, string> = {
		xs: 'rounded-[3px]',
		sm: 'rounded',
		md: 'rounded-md',
		lg: 'rounded-lg',
		full: 'rounded-full'
	};

	const blockClass = $derived(brand ? 'skeleton-block-brand' : 'skeleton-block-shimmer');
	const style = $derived(delay != null ? `--skeleton-delay: ${delay}ms` : undefined);
</script>

<div class="{blockClass} {roundedClass[rounded]} {className}" style={style} aria-hidden="true"></div>
