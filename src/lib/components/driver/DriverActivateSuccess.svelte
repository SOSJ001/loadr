<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { ArrowRight, Check } from '@lucide/svelte';

	type Props = {
		driverName: string;
		jobsHref?: string;
		preview?: boolean;
	};

	let { driverName, jobsHref = '/jobs', preview = false }: Props = $props();

	const firstName = $derived(driverName.trim().split(/\s+/)[0] || driverName);

	onMount(() => {
		if (preview) return;

		const timeoutId = window.setTimeout(() => {
			void goto(jobsHref);
		}, 1500);

		return () => window.clearTimeout(timeoutId);
	});
</script>

<div class="mx-auto flex w-full max-w-[390px] flex-1 flex-col items-center justify-center px-5 text-center">
	<div
		class="flex size-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-950"
		aria-hidden="true"
	>
		<Check size={48} class="text-brand" stroke-width={1.75} />
	</div>

	<h2 class="font-syne mt-6 text-[26px] font-extrabold text-gray-900 dark:text-slate-100">
		You're all set!
	</h2>
	<p class="font-inter mt-2 text-[15px] text-gray-500 dark:text-slate-400">
		Your account is active.
	</p>
	<p class="font-inter mt-1 text-[15px] font-semibold text-brand">
		Welcome to Loadr, {firstName}.
	</p>
</div>

<div
	class="sticky bottom-0 border-t border-gray-200 bg-white px-5 pt-4 pb-[34px] dark:border-slate-700 dark:bg-slate-900"
>
	<a
		href={jobsHref}
		class="font-syne mx-auto flex h-[52px] w-full max-w-[350px] items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-bold text-white transition-colors hover:bg-[#178566]"
	>
		Go to my jobs
		<ArrowRight size={18} stroke-width={1.75} aria-hidden="true" />
	</a>
</div>
