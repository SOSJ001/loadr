export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'loadr-theme';

function readStoredTheme(): Theme | null {
	if (typeof localStorage === 'undefined') return null;
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored === 'dark' || stored === 'light' ? stored : null;
}

function readSystemTheme(): Theme {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
	if (typeof document === 'undefined') return;
	document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const themeState = $state<{ value: Theme }>({ value: 'light' });

export function initTheme() {
	const theme = readStoredTheme() ?? readSystemTheme();
	themeState.value = theme;
	applyTheme(theme);
}

export function setTheme(theme: Theme) {
	themeState.value = theme;
	localStorage.setItem(STORAGE_KEY, theme);
	applyTheme(theme);
}

export function toggleTheme() {
	setTheme(themeState.value === 'dark' ? 'light' : 'dark');
}
