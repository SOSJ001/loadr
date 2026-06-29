import { goto } from '$app/navigation';

export async function logout(redirectTo = '/login') {
	const response = await fetch('/api/v1/auth/logout', { method: 'POST' });

	if (!response.ok) {
		throw new Error('Logout failed');
	}

	await goto(redirectTo, { invalidateAll: true });
}
