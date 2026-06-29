export type OfflineQueueItem =
	| {
			id: string;
			type: 'start_job';
			jobId: string;
			createdAt: string;
	  }
	| {
			id: string;
			type: 'complete_job';
			jobId: string;
			createdAt: string;
			recipientName?: string;
			photo: Blob;
			photoName: string;
			photoType: string;
	  }
	| {
			id: string;
			type: 'report_issue';
			jobId: string;
			createdAt: string;
			reason: string;
			otherDescription?: string;
			notes?: string;
			photo?: Blob;
			photoName?: string;
			photoType?: string;
	  };
