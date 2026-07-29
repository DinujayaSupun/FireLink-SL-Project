import React from "react";

/**
 * The one button. Variants map to intent, not colour-picking:
 *   primary   — the single main action per view (solid fire red)
 *   secondary — neutral, outlined
 *   danger    — destructive (delete); soft red so it reads distinct from primary
 *   ghost     — low-emphasis (cancel, inline)
 *
 * Usage:  <Button variant="primary">Add Item</Button>
 */
const VARIANTS = {
	primary: "bg-fire text-white hover:bg-fire-dark border border-transparent",
	secondary: "bg-white text-navy border border-gray-300 hover:bg-gray-50",
	danger: "bg-fire-50 text-fire border border-fire-200 hover:bg-fire-100",
	ghost: "bg-transparent text-gray-600 border border-transparent hover:bg-gray-100",
};

const SIZES = {
	sm: "text-xs px-3 py-1.5 gap-1.5",
	md: "text-sm px-4 py-2 gap-2",
	lg: "text-base px-5 py-2.5 gap-2",
};

export default function Button({
	variant = "primary",
	size = "md",
	type = "button",
	className = "",
	children,
	...props
}) {
	return (
		<button
			type={type}
			className={[
				"inline-flex items-center justify-center font-semibold rounded-md",
				"transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-1",
				"disabled:opacity-45 disabled:cursor-not-allowed",
				VARIANTS[variant] || VARIANTS.primary,
				SIZES[size] || SIZES.md,
				className,
			].join(" ")}
			{...props}
		>
			{children}
		</button>
	);
}
