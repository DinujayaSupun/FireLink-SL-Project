import React from "react";

/**
 * The one page header: a title, optional subtitle, and an optional action slot
 * on the right (usually the single primary Button for the page).
 *
 *   <PageHeader title="Inventory Management" subtitle="Track equipment…"
 *               actions={<Button variant="primary">+ Add Item</Button>} />
 */
export default function PageHeader({ title, subtitle, actions, className = "" }) {
	return (
		<div className={["flex items-start justify-between gap-4 mb-6", className].join(" ")}>
			<div>
				<h1 className="text-2xl font-bold text-navy leading-tight">{title}</h1>
				{subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
			</div>
			{actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
		</div>
	);
}
