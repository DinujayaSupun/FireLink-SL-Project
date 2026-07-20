import React from "react";

/**
 * The corrected stat tile: a neutral card with a big dark number and one small
 * icon — replacing the solid-colour blocks and saturated gradients the
 * dashboards use today. Colour appears only if the number itself is a warning
 * (`tone="warn"|"bad"|"good"`), never as decoration.
 *
 *   <StatTile label="Total Items" value={631} icon={<Boxes size={16}/>} />
 *   <StatTile label="Low Stock" value={2} tone="warn" delta="needs reorder" />
 */
const NUM_TONE = {
	default: "text-navy",
	good: "text-success-dark",
	warn: "text-amber-dark",
	bad: "text-fire",
};

export default function StatTile({ label, value, icon, tone = "default", delta, deltaTone }) {
	return (
		<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-2">
			<div className="flex items-start justify-between">
				<span className="text-xs font-medium text-gray-500">{label}</span>
				{icon && (
					<span className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-navy">
						{icon}
					</span>
				)}
			</div>
			<span className={["text-2xl font-bold tabular-nums leading-none", NUM_TONE[tone]].join(" ")}>
				{value}
			</span>
			{delta && (
				<span
					className={[
						"text-xs font-semibold",
						deltaTone === "down" ? "text-fire" : deltaTone === "up" ? "text-success-dark" : "text-gray-500",
					].join(" ")}
				>
					{delta}
				</span>
			)}
		</div>
	);
}
