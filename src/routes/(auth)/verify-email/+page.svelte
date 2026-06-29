<script lang="ts">
	import { page } from '$app/state';
	import EmailVerificationCard from '$lib/components/auth/EmailVerificationCard.svelte';

	const email = $derived(page.url.searchParams.get('email') ?? 'dave@davescouriers.co.uk');
</script>

<div class="flex w-full max-w-[440px] flex-col items-center">
	<EmailVerificationCard {email} />
</div>
