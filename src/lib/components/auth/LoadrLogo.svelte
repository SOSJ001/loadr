<script lang="ts">
	type Props = {
		href?: string;
		class?: string;
	};

	let { href = '/', class: className = '' }: Props = $props();
</script>

<a href={href} class="inline-flex font-syne text-2xl font-extrabold leading-none {className}">
	<span class="text-gray-900 dark:text-slate-100">load</span><span class="text-brand">r</span>
</a>
