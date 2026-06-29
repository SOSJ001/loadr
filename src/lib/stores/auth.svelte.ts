import type { UserProfile } from '$lib/types/user';

export const authState = $state<{ profile: UserProfile | null }>({
	profile: null
});

export function setAuthProfile(profile: UserProfile | null) {
	authState.profile = profile;
}
