<script lang="ts">
	import AuthCard from '$lib/components/auth/AuthCard.svelte';
	import AuthSecurityNote from '$lib/components/auth/AuthSecurityNote.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	type Props = {
		email: string;
	};

	let { email }: Props = $props();
</script>

<AuthCard class="items-center">
	<div class="flex w-full flex-col items-center gap-2.5 sm:gap-3">
		<div class="flex h-20 w-full items-center justify-center" aria-hidden="true">
			<div
				class="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="40"
					height="40"
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
			Check your email
		</h1>

		<p class="w-full text-center font-inter text-sm text-gray-500 dark:text-slate-400">
			If an account exists for
		</p>
		<p
			class="w-full break-words text-center font-inter text-sm font-semibold text-gray-500 sm:font-medium sm:text-gray-900 dark:font-semibold dark:text-slate-100"
		>
			{email}
		</p>
		<p
			class="w-full text-center font-inter text-sm text-gray-900 sm:text-gray-500 dark:text-slate-400"
		>
			we've sent a password reset link
		</p>

		<AuthSecurityNote>
			For security, we don't confirm whether an email is registered
		</AuthSecurityNote>

		<Button href="/login" variant="secondary" size="auth" class="w-full">
			Back to log in
		</Button>
	</div>
</AuthCard>
