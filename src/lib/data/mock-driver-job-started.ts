import type { DriverJobStartedPageData } from '$lib/types/driver-job-started';

const MOCK_JOB_STARTED_BASE: DriverJobStartedPageData = {
	id: 'job-0042',
	reference: '#0042',
	pickup_address: '14 Bold Street, Liverpool, L1 4AF',
	destination_label: 'Manchester',
	started_at_label: '9:14am',
	scheduled_time_label: '9:30am',
	show_fragile_tag: false
};

/** Figma 6A — Job Started (Default), #0042 */
export function mockDriverJobStartedPageData(): DriverJobStartedPageData {
	return { ...MOCK_JOB_STARTED_BASE };
}

/** Figma 6B — Job Started (Fragile), #0042 */
export function mockDriverJobStartedFragilePageData(): DriverJobStartedPageData {
	return {
		...MOCK_JOB_STARTED_BASE,
		show_fragile_tag: true
	};
}
