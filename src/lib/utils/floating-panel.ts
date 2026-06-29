export type FloatingPanelPosition = {
	top: number;
	left: number;
	width: number;
};

type PositionOptions = {
	gap?: number;
	padding?: number;
	minWidth?: number;
};

/** Position a fixed panel beside its anchor, flipping above when needed. */
export function positionFloatingPanel(
	anchor: HTMLElement,
	panel: HTMLElement,
	options: PositionOptions = {}
): FloatingPanelPosition {
	const gap = options.gap ?? 4;
	const padding = options.padding ?? 8;
	const minWidth = options.minWidth ?? 280;

	const anchorRect = anchor.getBoundingClientRect();
	const panelHeight = panel.offsetHeight;
	const panelWidth = Math.max(anchorRect.width, minWidth);

	let left = anchorRect.left;
	if (left + panelWidth > window.innerWidth - padding) {
		left = window.innerWidth - panelWidth - padding;
	}
	left = Math.max(padding, left);

	const spaceBelow = window.innerHeight - anchorRect.bottom - gap - padding;
	const spaceAbove = anchorRect.top - gap - padding;

	let top: number;
	if (panelHeight <= spaceBelow || spaceBelow >= spaceAbove) {
		top = anchorRect.bottom + gap;
	} else {
		top = anchorRect.top - gap - panelHeight;
	}

	top = Math.max(padding, Math.min(top, window.innerHeight - panelHeight - padding));

	return { top, left, width: panelWidth };
}

export function floatingPanelStyle(position: FloatingPanelPosition): string {
	return `top: ${position.top}px; left: ${position.left}px; width: ${position.width}px;`;
}
