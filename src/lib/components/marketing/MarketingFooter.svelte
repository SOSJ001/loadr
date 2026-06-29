<script lang="ts">
	import LoadrLogo from '$lib/components/auth/LoadrLogo.svelte';
</script>

<footer
	class="border-t border-gray-200 bg-gray-50 px-5 py-10 lg:px-8 lg:py-12 dark:border-slate-700 dark:bg-slate-800"
>
	<div class="mx-auto flex max-w-[1216px] flex-col gap-8">
		<div class="flex flex-col gap-10 lg:grid lg:grid-cols-3 lg:gap-10">
			<div class="flex flex-col gap-3">
				<LoadrLogo />
				<p class="max-w-[220px] text-[13px] leading-normal text-gray-500 dark:text-slate-400">
					The B2B marketplace for spare logistics capacity.
				</p>
			</div>

			<div class="flex flex-col gap-3">
				<p class="text-xs font-semibold tracking-wider text-gray-500 dark:text-slate-400">PRODUCT</p>
				<div class="flex flex-col gap-2.5 text-sm text-gray-900 dark:text-slate-100">
					<a href="/pricing" class="hover:text-brand">Pricing</a>
					<a href="/login" class="hover:text-brand">Operator log in</a>
					<a href="/login/driver" class="hover:text-brand">Driver log in</a>
					<a href="/signup" class="hover:text-brand">Sign up</a>
				</div>
			</div>

			<div class="flex flex-col gap-3">
				<p class="text-xs font-semibold tracking-wider text-gray-500 dark:text-slate-400">LEGAL</p>
				<div class="flex flex-col gap-2.5 text-sm text-gray-900 dark:text-slate-100">
					<a href="/terms" class="hover:text-brand">Terms of Service</a>
					<a href="/privacy" class="hover:text-brand">Privacy Policy</a>
				</div>
			</div>
		</div>

		<div class="h-px bg-gray-200 dark:bg-slate-700"></div>
		<p class="text-center text-xs text-gray-500 dark:text-slate-400">
			© 2026 Loadr Ltd. All rights reserved.
		</p>
	</div>
</footer>
