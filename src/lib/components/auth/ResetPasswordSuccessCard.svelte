<script lang="ts">
	import AuthCard from '$lib/components/auth/AuthCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
</script>

<AuthCard class="items-center">
	<div class="flex w-full flex-col items-center gap-2.5 sm:gap-3">
		<div class="flex h-20 w-full items-center justify-center" aria-hidden="true">
			<div
				class="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="36"
					height="36"
					viewBox="0 0 24 24"
					fill="none"
					class="text-green-600 dark:text-green-500"
				>
					<path
						d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
		</div>

		<h1
			class="w-full text-center font-syne text-[22px] font-bold text-gray-900 sm:text-2xl dark:text-slate-100"
		>
			Password updated
		</h1>

		<p class="w-full text-center font-inter text-sm text-gray-500 dark:text-slate-400">
			You can now log in with your new password
		</p>

		<Button href="/login" variant="brand" size="auth" class="w-full">
			Go to log in
		</Button>
	</div>
</AuthCard>
