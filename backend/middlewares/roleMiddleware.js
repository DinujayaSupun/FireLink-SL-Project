// Positions reach us in several shapes: the Add Staff form issues "chief officer"
// and "financemanager", while route guards were written as "finance_manager".
// Comparing on a normalised key stops spacing/underscores from denying a
// legitimate role. Also tolerates a missing position instead of throwing.
const normalizePosition = (position) =>
	String(position ?? "")
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "");

const authorizePositions = (positions) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: "Not authorized" });
		}

		const userPosition = normalizePosition(req.user.position);
		const allowedPositions = positions.map(normalizePosition);

		if (!userPosition || !allowedPositions.includes(userPosition)) {
			return res
				.status(403)
				.json({ message: `Access denied for position: ${req.user.position}` });
		}

		next();
	};
};

module.exports = { authorizePositions, normalizePosition };
