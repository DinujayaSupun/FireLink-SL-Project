import React from "react";

/**
 * Status pill. Colour carries meaning only — never decoration.
 *   good     — active, available, paid, approved   (green)
 *   warn     — low stock, pending, overdue          (amber)
 *   bad      — expired, rejected, error             (red)
 *   neutral  — draft, closed, n/a                   (grey)
 *
 * A `status` string can be passed instead of `tone` and it maps common
 * app statuses to the right colour, so tables can do <Badge status={row.status} />.
 */
const TONES = {
	good: "bg-success-100 text-success-dark",
	warn: "bg-amber-100 text-amber-dark",
	bad: "bg-fire-100 text-fire-dark",
	neutral: "bg-gray-100 text-gray-600",
};

const STATUS_TONE = {
	active: "good", available: "good", approved: "good", paid: "good", completed: "good", open: "good",
	"in use": "warn", "low stock": "warn", pending: "warn", "in transit": "warn", overdue: "warn", assigned: "warn",
	expired: "bad", rejected: "bad", damaged: "bad", overdrawn: "bad", "expires soon": "bad",
	inactive: "neutral", closed: "neutral", draft: "neutral", suspended: "neutral", retired: "neutral",
};

export default function Badge({ tone, status, children, className = "" }) {
	const resolved = tone || STATUS_TONE[String(status || children || "").toLowerCase()] || "neutral";
	return (
		<span
			className={[
				"inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
				TONES[resolved],
				className,
			].join(" ")}
		>
			<span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
			{children || status}
		</span>
	);
}
