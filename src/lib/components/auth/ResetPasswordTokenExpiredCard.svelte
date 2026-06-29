<script lang="ts">
	import AuthCard from '$lib/components/auth/AuthCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
</script>

<AuthCard class="items-center">
	<div class="flex w-full flex-col items-center gap-2.5 sm:gap-3">
		<div class="flex h-20 w-full items-center justify-center" aria-hidden="true">
			<div
				class="flex size-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="36"
					height="36"
					viewBox="0 0 24 24"
					fill="none"
					class="text-amber-600 dark:text-amber-500"
				>
					<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
					<path
						d="M12 7v5l3 2"
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
			This link has expired
		</h1>

		<p
			class="w-full text-center font-inter text-sm leading-normal text-gray-500 dark:text-slate-400"
		>
			Password reset links expire after 1 hour for security. Request a new one below.
		</p>

		<Button href="/forgot-password" variant="brand" size="auth" class="w-full">
			Request new link
		</Button>
	</div>
</AuthCard>
