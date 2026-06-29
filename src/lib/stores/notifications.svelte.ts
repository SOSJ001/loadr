export type NotificationItem = {
	id: string;
	title: string;
	body: string;
	is_read: boolean;
};

export const notificationsState = $state<{ items: NotificationItem[] }>({
	items: []
});
