import React from "react";

/**
 * The one surface. White card, hairline border, soft shadow, rounded.
 * Everything that groups content sits in a Card — panels, forms, tables.
 *
 *   <Card>…</Card>
 *   <Card className="p-0">  (opt out of default padding, e.g. to wrap a table)
 */
export default function Card({ as: Tag = "div", className = "", children, ...props }) {
	return (
		<Tag
			className={[
				"bg-white border border-gray-200 rounded-lg shadow-sm",
				className.includes("p-") ? "" : "p-5",
				className,
			].join(" ")}
			{...props}
		>
			{children}
		</Tag>
	);
}
