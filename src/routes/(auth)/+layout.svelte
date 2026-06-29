<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const isVerifyEmail = $derived(page.url.pathname === '/verify-email');
	const isDriverLogin = $derived(page.url.pathname === '/login/driver');
</script>

{#if isDriverLogin}
	{@render children()}
{:else}
	<div
		class="flex min-h-dvh flex-col items-center justify-center overflow-y-auto px-5 py-4 sm:px-4 sm:py-6 {isVerifyEmail
			? 'bg-gray-50'
			: 'bg-white'} dark:bg-slate-900"
	>
		<div class="my-auto flex w-full flex-col items-center">
			{@render children()}
		</div>
	</div>
{/if}
