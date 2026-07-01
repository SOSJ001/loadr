/** Figma animation spec — Skeleton Loading (node 1012:2104). */
export const SKELETON_SHIMMER_DURATION_MS = 1500;
export const SKELETON_STAGGER_MAX_MS = 150;
export const SKELETON_FADE_IN_MS = 200;
export const SKELETON_FADE_OUT_MS = 300;
export const SKELETON_MIN_DISPLAY_MS = 400;

/** Row-by-row stagger, capped at 150ms. */
export function skeletonStagger(index: number, stepMs = 25): number {
	return Math.min(index * stepMs, SKELETON_STAGGER_MAX_MS);
}
