<script lang="ts">
	import { page } from '$app/state';
	import ErrorPage from '$lib/components/ui/ErrorPage.svelte';
	import { errorPageHomeHref } from '$lib/utils/error-page';

	let { error, status }: { error: App.Error; status: number } = $props();

	const message = $derived(error?.message ?? 'Something went wrong');
	const homeHref = $derived(errorPageHomeHref(page.url.pathname));
</script>

<ErrorPage {status} {message} {homeHref} />
