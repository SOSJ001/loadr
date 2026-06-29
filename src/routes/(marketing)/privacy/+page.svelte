<script lang="ts">
	import LegalDocumentPage from '$lib/components/marketing/LegalDocumentPage.svelte';

	const sections = [
		{
			id: 'what-we-collect',
			title: '1. What We Collect',
			body: 'Lorem ipsum placeholder copy for 1. What We Collect. Replace with final legal text before launch.'
		},
		{
			id: 'how-we-use-data',
			title: '2. How We Use Your Data',
			body: 'Lorem ipsum placeholder copy for 2. How We Use Your Data. Replace with final legal text before launch.'
		},
		{
			id: 'data-sharing',
			title: '3. Data Sharing',
			body: 'Lorem ipsum placeholder copy for 3. Data Sharing. Replace with final legal text before launch.'
		},
		{
			id: 'your-rights',
			title: '4. Your Rights (UK GDPR)',
			body: 'Lorem ipsum placeholder copy for 4. Your Rights (UK GDPR). Replace with final legal text before launch.'
		},
		{
			id: 'data-retention',
			title: '5. Data Retention',
			body: 'Lorem ipsum placeholder copy for 5. Data Retention. Replace with final legal text before launch.'
		},
		{
			id: 'blockchain-data-notice',
			title: '6. Blockchain Data Notice',
			callout:
				'Section 6 explains how proof of delivery hashes are stored on the Solana blockchain. This contains no personal data, only cryptographic fingerprints.',
			body: 'Lorem ipsum placeholder copy for 6. Blockchain Data Notice. Replace with final legal text before launch.'
		},
		{
			id: 'contact',
			title: '7. Contact',
			body: 'Lorem ipsum placeholder copy for 7. Contact. Replace with final legal text before launch.'
		}
	];
</script>

<LegalDocumentPage title="Privacy Policy" lastUpdated="9 June 2026" {sections} />
