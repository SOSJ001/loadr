export type InviteCountdownParts = {
	hours: number;
	minutes: number;
	seconds: number;
	expired: boolean;
};

export function inviteTimeRemaining(expiresAt: string | null): InviteCountdownParts {
	if (!expiresAt) {
		return { hours: 0, minutes: 0, seconds: 0, expired: true };
	}

	const diff = new Date(expiresAt).getTime() - Date.now();
	if (diff <= 0) {
		return { hours: 0, minutes: 0, seconds: 0, expired: true };
	}

	const totalSeconds = Math.floor(diff / 1000);
	return {
		hours: Math.floor(totalSeconds / 3600),
		minutes: Math.floor((totalSeconds % 3600) / 60),
		seconds: totalSeconds % 60,
		expired: false
	};
}

export function formatInviteCountdown(parts: Omit<InviteCountdownParts, 'expired'>): string {
	const pad = (value: number) => String(value).padStart(2, '0');
	return `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
}

export function buildDriverActivateUrl(origin: string, token: string): string {
	const params = new URLSearchParams({ token });
	return `${origin}/activate?${params.toString()}`;
}
