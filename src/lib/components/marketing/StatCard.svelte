<script lang="ts">
	type Props = {
		value: string;
		title: string;
		subtitle: string;
	};

	let { value, title, subtitle }: Props = $props();
</script>

<div
	class="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white p-6 text-center lg:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 lg:dark:bg-slate-800"
>
	<p class="font-syne text-4xl font-extrabold text-brand">{value}</p>
	<p class="font-inter text-[15px] font-medium text-gray-900 dark:text-slate-100">{title}</p>
	<p class="font-inter text-sm text-gray-500 dark:text-slate-400">{subtitle}</p>
</div>
