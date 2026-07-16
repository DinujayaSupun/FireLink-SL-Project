/**
 * End-to-end smoke tests for the FireLink API.
 *
 * These are integration tests, not unit tests: they drive the real server against
 * the real database. Deliberately dependency-free so the suite runs without
 * adding a test framework to the project.
 *
 *   1. npm run seed:all      (seeds the accounts these tests sign in as)
 *   2. npm run backend:dev   (in another terminal)
 *   3. npm run test:api
 *
 * Staff IDs are looked up from the database rather than hardcoded, because the
 * seeder mints a fresh timestamped staffId on every run.
 *
 * Anything the suite creates, it deletes again.
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../config/config.env") });

const API = process.env.TEST_API_URL || `http://localhost:${process.env.PORT || 5000}`;
const PW = process.env.SEED_PASSWORD || "password123";

const results = [];
let currentModule = "";

// ---------------------------------------------------------------- helpers

const call = async (method, url, { token, body, form } = {}) => {
	const headers = {};
	if (token) headers.Authorization = `Bearer ${token}`;
	let payload;
	if (form) {
		headers["Content-Type"] = "application/x-www-form-urlencoded";
		payload = new URLSearchParams(form).toString();
	} else if (body) {
		headers["Content-Type"] = "application/json";
		payload = JSON.stringify(body);
	}
	try {
		const res = await fetch(`${API}${url}`, { method, headers, body: payload });
		const text = await res.text();
		let json = null;
		try {
			json = JSON.parse(text);
		} catch {
			/* html or plain text response */
		}
		return { status: res.status, json, text };
	} catch (err) {
		return { status: 0, json: null, text: err.message };
	}
};

const describe = (name) => {
	currentModule = name;
};

/** Asserts the response status is one of `expect`. Returns the response. */
const expectStatus = async (name, method, url, opts = {}, expect = [200, 201]) => {
	const want = Array.isArray(expect) ? expect : [expect];
	const res = await call(method, url, opts);
	results.push({
		module: currentModule,
		name,
		ok: want.includes(res.status),
		detail: `${method} ${url} -> ${res.status}, wanted ${want.join("/")}`,
	});
	return res;
};

/** Asserts an arbitrary condition. */
const assert = (name, condition, detail = "") => {
	results.push({ module: currentModule, name, ok: !!condition, detail });
};

const login = async (staffId) =>
	(await call("POST", "/users/stafflogin", { body: { staffId, password: PW } })).json?.token || null;

// ---------------------------------------------------------------- suite

const run = async () => {
	if (!process.env.DB_URI) {
		console.error("DB_URI is not set — check backend/config/config.env");
		process.exit(1);
	}

	const health = await call("GET", "/");
	if (health.status === 0) {
		console.error(`Cannot reach the API at ${API}. Start it with: npm run backend:dev`);
		process.exit(1);
	}

	await mongoose.connect(process.env.DB_URI);
	const users = mongoose.connection.collection("users");

	const staffIdFor = async (position) => {
		const doc = await users.findOne({ position });
		return doc?.staffId || null;
	};

	const ids = {
		chief: await staffIdFor("chief officer"),
		inventory: await staffIdFor("inventorymanager"),
		finance: await staffIdFor("finance_manager"),
		supply: await staffIdFor("supply_manager"),
		record: await staffIdFor("recordmanager"),
		fighter: await staffIdFor("fighter"),
	};

	const missing = Object.entries(ids).filter(([, v]) => !v).map(([k]) => k);
	if (missing.length) {
		console.error(`No seeded account for: ${missing.join(", ")}. Run: npm run seed:users`);
		await mongoose.disconnect();
		process.exit(1);
	}

	const tok = {};
	for (const [role, sid] of Object.entries(ids)) tok[role] = await login(sid);

	// ---------------- Auth ----------------
	describe("Auth");
	await expectStatus("valid staff login", "POST", "/users/stafflogin", { body: { staffId: ids.chief, password: PW } }, 200);
	await expectStatus("wrong password rejected", "POST", "/users/stafflogin", { body: { staffId: ids.chief, password: "wrong" } }, 401);
	await expectStatus("unknown staff id rejected", "POST", "/users/stafflogin", { body: { staffId: "NOPE1", password: PW } }, 401);
	await expectStatus("missing fields rejected", "POST", "/users/stafflogin", { body: {} }, 400);

	const loginRes = await call("POST", "/users/stafflogin", { body: { staffId: ids.chief, password: PW } });
	assert("login never returns the password hash", !("password" in (loginRes.json?.user || {})), "regression guard: the frontend persists this object to localStorage");

	// ---------------- Users ----------------
	describe("Users");
	await expectStatus("list staff", "GET", "/users", { token: tok.chief });
	await expectStatus("list staff requires a token", "GET", "/users", {}, 401);
	await expectStatus("create staff requires a token", "POST", "/users", {
		body: { name: "X", gmail: "anon@test.lk", age: 30, phone: "0770000099", position: "chief officer", status: "active", password: PW, address: "X" },
	}, 401);
	await expectStatus("fighter cannot create staff", "POST", "/users", {
		token: tok.fighter,
		body: { name: "X", gmail: "esc@test.lk", age: 30, phone: "0770000098", position: "chief officer", status: "active", password: PW, address: "X" },
	}, 403);

	const made = await expectStatus("chief can create staff", "POST", "/users", {
		token: tok.chief,
		body: { name: "Smoke Test User", gmail: "smoke@test.lk", age: 30, phone: "0771234567", position: "fighter", status: "active", password: PW, address: "Colombo" },
	});
	const tempUserId = made.json?.users?._id;
	assert("phone keeps its leading zero", made.json?.users?.phone === "0771234567", `stored as ${made.json?.users?.phone} (a Number type would drop the 0)`);

	await expectStatus("short password rejected", "POST", "/users", {
		token: tok.chief,
		body: { name: "X", gmail: "short@test.lk", age: 30, phone: "0770000097", position: "fighter", status: "active", password: "Ab1!", address: "X" },
	}, 400);
	await expectStatus("duplicate email rejected", "POST", "/users", {
		token: tok.chief,
		body: { name: "X", gmail: "smoke@test.lk", age: 30, phone: "0770000096", position: "fighter", status: "active", password: PW, address: "X" },
	}, 409);
	if (tempUserId) await expectStatus("delete staff", "DELETE", `/users/${tempUserId}`, { token: tok.chief }, [200, 204]);

	// ---------------- Inventory ----------------
	describe("Inventory");
	await expectStatus("list requires a token", "GET", "/api/inventory", {}, 401);
	await expectStatus("inventory manager can list", "GET", "/api/inventory?limit=5", { token: tok.inventory });
	await expectStatus("fighter cannot list", "GET", "/api/inventory?limit=5", { token: tok.fighter }, 403);

	const item = await expectStatus("create item", "POST", "/api/inventory", {
		token: tok.inventory,
		body: { item_ID: 990100, item_name: "SMOKE TEST ITEM", category: "Tools", quantity: 10, condition: "Good", location: "Main Station - Tool Storage", status: "Available", threshold: 2 },
	});
	const itemId = item.json?.data?._id;

	if (itemId) {
		const added = await expectStatus("add quantity", "POST", `/api/inventory/${itemId}/add-quantity`, { token: tok.inventory, body: { amount: 5, reason: "smoke test" } });
		assert("add-quantity arithmetic (10 + 5)", added.json?.data?.quantity === 15, `quantity is ${added.json?.data?.quantity}, expected 15`);

		const removed = await expectStatus("remove quantity", "POST", `/api/inventory/${itemId}/remove-quantity`, { token: tok.inventory, body: { amount: 3, reason: "smoke test" } });
		assert("remove-quantity arithmetic (15 - 3)", removed.json?.data?.quantity === 12, `quantity is ${removed.json?.data?.quantity}, expected 12`);

		await expectStatus("cannot remove more than held", "POST", `/api/inventory/${itemId}/remove-quantity`, { token: tok.inventory, body: { amount: 9999, reason: "overdraw" } }, 400);
		await expectStatus("inventory manager cannot delete", "DELETE", `/api/inventory/${itemId}`, { token: tok.inventory }, 403);
		await expectStatus("chief can delete", "DELETE", `/api/inventory/${itemId}`, { token: tok.chief }, [200, 204]);
	}

	await expectStatus("vehicles", "GET", "/api/inventory-vehicles", { token: tok.inventory });
	await expectStatus("vehicle items", "GET", "/api/inventory-vehicle-items", { token: tok.inventory });
	await expectStatus("reorders", "GET", "/api/inventory-reorders", { token: tok.inventory });
	await expectStatus("logs", "GET", "/api/inventory-logs", { token: tok.inventory });

	// ---------------- Training + QR attendance ----------------
	describe("Training");
	await expectStatus("list sessions", "GET", "/sessions", {});
	const session = await expectStatus("create session", "POST", "/sessions", {
		body: { title: "SMOKE TEST SESSION", description: "smoke test", date: "2026-08-01", venue: "HQ", teamMembers: ["Fire Fighter"], createdBy: "smoke-test" },
	});
	const sessionId = session.json?.session?._id;

	if (sessionId) {
		const gen = await expectStatus("generate QR token", "GET", `/sessions/generate/${sessionId}`, {});
		const token = gen.json?.token;
		assert("QR token is signed (payload.signature)", typeof token === "string" && token.split(".").length === 2, "an unsigned token would be forgeable");

		if (token) {
			await expectStatus("QR scan page renders", "GET", `/sessions/attendance/scan/${encodeURIComponent(token)}`, {});
			const marked = await expectStatus("mark attendance via QR", "POST", "/sessions/attendance/mark", {
				form: { token, staffId: ids.fighter, name: "Smoke Fighter" },
			});
			assert("attendance actually recorded", marked.json?.status === "ok", marked.json?.message || "");
		}

		// A token minted without the secret must not be accepted.
		const forged = Buffer.from(JSON.stringify({ sessionId, expires: Date.now() + 9e5 })).toString("base64");
		await expectStatus("forged QR token rejected", "GET", `/sessions/attendance/scan/${forged}`, {}, 400);

		await expectStatus("delete session", "DELETE", `/sessions/${sessionId}`, {}, [200, 204]);
	}

	// ---------------- Finance ----------------
	describe("Finance");
	await expectStatus("budget requires a token", "GET", "/api/v1/finance/budget", {}, 401);
	await expectStatus("fighter cannot read budget", "GET", "/api/v1/finance/budget?supplyManagerId=1", { token: tok.fighter }, 403);

	const all = await expectStatus("expenses (all)", "GET", "/api/v1/finance/expenses?all=true", { token: tok.finance });
	const rows = all.json?.data || [];
	const apiTotal = rows.reduce((a, r) => a + (r.amount || 0), 0);
	const dbAgg = await mongoose.connection
		.collection("expenses")
		.aggregate([{ $group: { _id: null, n: { $sum: 1 }, total: { $sum: "$amount" } } }])
		.toArray();
	const db = dbAgg[0] || { n: 0, total: 0 };
	assert("expense count matches the database", rows.length === db.n, `API ${rows.length} vs DB ${db.n}`);
	assert("expense total matches the database", apiTotal === db.total, `API ${apiTotal} vs DB ${db.total}`);

	await expectStatus("salaries", "GET", "/api/v1/salaries", { token: tok.finance });

	// ---------------- Supply ----------------
	describe("Supply");
	await expectStatus("suppliers require a token", "GET", "/api/v1/supplier/get-suppliers", {}, 401);
	await expectStatus("supply manager reaches supply requests", "GET", "/api/v1/supply-requests", { token: tok.supply });

	// ---------------- Cross-identity ----------------
	describe("Token isolation");
	await call("POST", "/api/v1/civilian-auth/register", {
		body: { firstName: "Smoke", lastName: "Civilian", email: "smokeciv@test.lk", username: "smokeciv", password: "password123", phoneNumber: "0771111111", address: "Colombo" },
	});
	const civ = await call("POST", "/api/v1/civilian-auth/login", { body: { email: "smokeciv@test.lk", password: "password123" } });
	const civToken = civ.json?.token;
	assert("civilian login issues a token", !!civToken, "");
	if (civToken) {
		// All three identities share JWT_SECRET, so only the `type` claim keeps them apart.
		await expectStatus("civilian token rejected on /users", "GET", "/users", { token: civToken }, 401);
		await expectStatus("civilian token rejected on inventory", "GET", "/api/inventory", { token: civToken }, 401);
		await expectStatus("civilian token rejected on supplier api", "GET", "/api/v1/supplier/get-suppliers", { token: civToken }, 401);
	}

	// ---------------- cleanup ----------------
	await mongoose.connection.collection("civilians").deleteMany({ email: "smokeciv@test.lk" });
	await users.deleteMany({ gmail: { $in: ["smoke@test.lk", "anon@test.lk", "esc@test.lk", "short@test.lk"] } });
	await mongoose.connection.collection("inventories").deleteMany({ item_name: "SMOKE TEST ITEM" });
	await mongoose.connection.collection("trainingsessions").deleteMany({ title: "SMOKE TEST SESSION" });
	await mongoose.connection.collection("attendances").deleteMany({ name: "Smoke Fighter" });
	await mongoose.disconnect();

	// ---------------- report ----------------
	const byModule = {};
	for (const r of results) (byModule[r.module] ||= []).push(r);

	for (const [mod, rows] of Object.entries(byModule)) {
		const pass = rows.filter((r) => r.ok).length;
		console.log(`\n${mod}  (${pass}/${rows.length})`);
		for (const r of rows) {
			console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : `\n        ${r.detail}`}`);
		}
	}

	const passed = results.filter((r) => r.ok).length;
	console.log(`\n${"=".repeat(56)}`);
	console.log(`  ${passed}/${results.length} passed, ${results.length - passed} failed`);
	console.log("=".repeat(56));

	process.exit(passed === results.length ? 0 : 1);
};

run().catch((err) => {
	console.error("\nSuite crashed:", err.message);
	process.exit(1);
});
