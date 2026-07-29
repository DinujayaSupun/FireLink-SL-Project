/**
 * Brand colours for JavaScript consumers.
 *
 * In JSX and CSS, prefer the Tailwind utilities (bg-navy, text-fire, ring-amber)
 * or the CSS variables (var(--color-fire)) — both come from the @theme block in
 * src/index.css.
 *
 * This module exists for the places those cannot reach: Chart.js and other
 * canvas rendering resolve colours in JS, where var() is not evaluated.
 *
 * These values mirror @theme in src/index.css — change both together.
 */

export const colors = {
	// Navy — sidebars, headers, dark surfaces
	navy: "#1e2a38",
	navyLight: "#2c3e50",
	navyDark: "#141d27",

	// Fire red — primary actions, alerts, brand
	fire: "#c62828",
	fireDark: "#b71c1c",
	fireLight: "#ef5350",
	fire50: "#fef2f2",
	fire100: "#fee2e2",
	fire200: "#fecaca",
	fire300: "#fca5a5",

	// Amber — accents, focus, warnings
	amber: "#ff9800",
	amberDark: "#f57c00",
	amberLight: "#ffb74d",
	amber50: "#fffbeb",
	amber100: "#fef3c7",
	amber200: "#fde68a",
	amber300: "#fcd34d",

	// Semantic — success
	success: "#10b981",
	successDark: "#059669",
	success50: "#f0fdf4",
	success100: "#dcfce7",
	success200: "#bbf7d0",
	success300: "#86efac",

	// Semantic — info (also the home for stray blue/indigo/purple accents)
	info: "#3b82f6",
	infoDark: "#2563eb",
	info50: "#eff6ff",
	info100: "#dbeafe",
	info200: "#bfdbfe",
	info300: "#93c5fd",
};

/**
 * Ordered palette for charts with several series. Brand colours lead, so the
 * first two or three series look like they belong to this app.
 */
export const chartPalette = [
	colors.fire,
	colors.navy,
	colors.amber,
	colors.success,
	colors.info,
	colors.fireLight,
	colors.navyLight,
	colors.amberDark,
];

/** Semi-transparent variants for chart fills. */
export const withAlpha = (hex, alpha) => {
	const h = hex.replace("#", "");
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default colors;
