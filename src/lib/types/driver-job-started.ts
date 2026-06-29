export type DriverJobStartedPageData = {
	id: string;
	reference: string;
	pickup_address: string;
	destination_label: string;
	started_at_label: string;
	scheduled_time_label: string;
	/** Shown when job notes indicate fragile handling (Figma 6B). */
	show_fragile_tag: boolean;
};
