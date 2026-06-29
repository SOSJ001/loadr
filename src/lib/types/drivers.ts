export type DriverStatus = 'active' | 'pending';

export type DriverLastActive = {
	primary: string;
	secondary?: string;
};

export type DriverListRow = {
	id: string;
	full_name: string;
	phone: string;
	status: DriverStatus;
	status_detail?: string;
	jobs_this_month: number;
	added_at: string;
	last_active: DriverLastActive | null;
	show_copy_phone?: boolean;
	actions: {
		view: boolean;
		resend?: boolean;
		more?: boolean;
	};
};

export type DriverProfileJobStatus = 'pending' | 'in_progress' | 'complete' | 'attempted';

export type DriverProfileJobRow = {
	id: string;
	reference: string;
	pickup_address: string;
	dropoff_address: string;
	status: DriverProfileJobStatus;
	date_label: string;
	show_view_action?: boolean;
};

export type DriverJobTab = 'all' | DriverProfileJobStatus;

export type DriverJobTabCounts = {
	all: number;
	pending: number;
	in_progress: number;
	complete: number;
	attempted: number;
};

export type DriverActivityKind = 'complete' | 'started' | 'attempted' | 'activated' | 'invite';

export type DriverActivityItem = {
	id: string;
	kind: DriverActivityKind;
	title: string;
	timestamp_label: string;
};

export type DriverProfileData = {
	plan: 'free' | 'pro';
	driver: {
		id: string;
		full_name: string;
		phone: string;
		status: DriverStatus;
		added_at: string;
		jobs_this_month: number;
		/** Shown in hero when plan is pro. */
		on_time_rate?: number;
		last_active: DriverLastActive | null;
	};
	/** Available on pro plan (9A). */
	performance?: {
		on_time_rate: number;
		total_jobs_done: number;
		attempted_deliveries: number;
		avg_jobs_per_week: number;
		jobs_per_week: { label: string; value: number }[];
	};
	jobs: {
		counts: DriverJobTabCounts;
		rows: DriverProfileJobRow[];
		pagination: { from: number; to: number; total: number };
	};
	activity: DriverActivityItem[];
	/** Pending drivers — activation URL for operator copy/share. */
	invite_link?: string | null;
};

export type DriversPageData = {
	plan: 'free' | 'pro';
	slotUsage: { used: number; limit: number };
	stats: {
		active: number;
		pending: number;
		jobsThisMonth: number;
		onJobNow: number;
	};
	drivers: DriverListRow[];
	/** UI preview — open add-driver panel on load (8C). */
	panelOpen?: boolean;
	/** UI preview — show invite success state in panel (8D). */
	panelSuccess?: boolean;
	/** UI preview — driver name shown on success screen (8D). */
	invitedDriverName?: string;
	/** UI preview — use mock invite flow instead of server action. */
	mockInvite?: boolean;
};
