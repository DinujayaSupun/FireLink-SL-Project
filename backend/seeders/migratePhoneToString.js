// One-off migration: users.phone was typed Number, which silently dropped the
// leading zero from Sri Lankan numbers (0771234567 -> 771234567). The schema now
// stores phone as a String; this restores the zero on documents written before
// that change.
//
// Usage:  node seeders/migratePhoneToString.js
// Safe to run more than once — documents already stored as valid strings are skipped.

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../config/config.env") });

const migrate = async () => {
	if (!process.env.DB_URI) {
		console.error("DB_URI is not set — check backend/config/config.env");
		process.exit(1);
	}

	await mongoose.connect(process.env.DB_URI);
	console.log("Connected to MongoDB");

	// Work through the raw collection: the Mongoose schema now declares phone as a
	// String, so numeric values would be cast on read and hide what is really stored.
	const collection = mongoose.connection.collection("users");
	const users = await collection.find({}).toArray();

	let converted = 0;
	let alreadyOk = 0;
	let needsAttention = 0;

	for (const user of users) {
		const { _id, phone } = user;

		if (typeof phone === "string" && /^0\d{9}$/.test(phone)) {
			alreadyOk++;
			continue;
		}

		const digits = String(phone ?? "").replace(/\D/g, "");
		let fixed = null;

		if (digits.length === 9) {
			fixed = `0${digits}`; // leading zero was eaten by the Number type
		} else if (digits.length === 10 && digits.startsWith("0")) {
			fixed = digits; // already complete, just stored as the wrong type
		}

		if (!fixed) {
			needsAttention++;
			console.warn(`  ! ${user.staffId || _id}: cannot infer a valid phone from "${phone}" — left unchanged`);
			continue;
		}

		await collection.updateOne({ _id }, { $set: { phone: fixed } });
		console.log(`  ${user.staffId || _id}: ${phone} -> ${fixed}`);
		converted++;
	}

	console.log(
		`\nDone. converted=${converted} alreadyValid=${alreadyOk} needsAttention=${needsAttention}`
	);

	await mongoose.disconnect();
	process.exit(needsAttention > 0 ? 1 : 0);
};

migrate().catch((err) => {
	console.error("Migration failed:", err.message);
	process.exit(1);
});
