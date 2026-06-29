<script lang="ts">
	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();
</script>

<div class="flex flex-col items-center gap-1.5 {className}">
	<p class="font-syne text-[28px] font-extrabold leading-[34px] text-gray-900 dark:text-slate-100">
		load<span class="text-brand">r</span>
	</p>
	<p
		class="font-inter text-xs font-medium tracking-[0.08em] text-gray-500 uppercase dark:text-slate-400"
	>
		Driver portal
	</p>
</div>
