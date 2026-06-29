/** Move an element to a DOM target (default `document.body`) so it escapes overflow clipping. */
export function portal(node: HTMLElement, target: string | HTMLElement = 'body') {
	const targetEl =
		typeof target === 'string'
			? (document.querySelector(target) as HTMLElement | null)
			: target;

	if (!targetEl) return;

	targetEl.appendChild(node);

	return {
		destroy() {
			node.remove();
		}
	};
}
