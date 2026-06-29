<script lang="ts">
	import ErrorPage from '$lib/components/ui/ErrorPage.svelte';

	let { error, status }: { error: App.Error; status: number } = $props();

	const message = $derived(error?.message ?? 'Something went wrong');
</script>

<ErrorPage {status} {message} homeHref="/jobs" />
