<script lang="ts">
	import LegalDocumentPage from '$lib/components/marketing/LegalDocumentPage.svelte';

	const sections = [
		{
			id: 'introduction',
			title: '1. Introduction',
			body: 'Lorem ipsum placeholder copy for 1. Introduction. Replace with final legal text before launch.'
		},
		{
			id: 'using-loadr',
			title: '2. Using Loadr',
			body: 'Lorem ipsum placeholder copy for 2. Using Loadr. Replace with final legal text before launch.'
		},
		{
			id: 'subscriptions-billing',
			title: '3. Subscriptions & Billing',
			body: 'Lorem ipsum placeholder copy for 3. Subscriptions & Billing. Replace with final legal text before launch.'
		},
		{
			id: 'data-privacy',
			title: '4. Data & Privacy',
			body: 'Lorem ipsum placeholder copy for 4. Data & Privacy. Replace with final legal text before launch.'
		},
		{
			id: 'liability',
			title: '5. Liability',
			body: 'Lorem ipsum placeholder copy for 5. Liability. Replace with final legal text before launch.'
		},
		{
			id: 'termination',
			title: '6. Termination',
			body: 'Lorem ipsum placeholder copy for 6. Termination. Replace with final legal text before launch.'
		},
		{
			id: 'contact',
			title: '7. Contact',
			body: 'Lorem ipsum placeholder copy for 7. Contact. Replace with final legal text before launch.'
		}
	];
</script>

<LegalDocumentPage title="Terms of Service" lastUpdated="9 June 2026" {sections} />
