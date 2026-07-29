const Supplier = require("../models/Supplier");
const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const { protect } = require("./authMiddleware");

// Checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
	const { token } = req.cookies;

	if (!token) {
		return next(new ErrorHandler("Login first to access this resource.", 401));
	}

	const decode = jwt.verify(token, process.env.JWT_SECRET);

	// Staff and civilian tokens are signed with the same secret, so check the
	// claim rather than trusting the signature to imply a supplier.
	if (decode.type !== "supplier") {
		return next(new ErrorHandler("Login first to access this resource.", 401));
	}

	req.supplier = await Supplier.findById(decode.id);

	if (!req.supplier) {
		res.cookie("token", null, {
			expires: new Date(Date.now()),
			httpOnly: true,
		});

		res.status(404);
		return next(new ErrorHandler("Supplier not found", 404));
	}
	next();
});

exports.isNotLoggedIn = catchAsyncErrors(async (req, res, next) => {
	const { token } = req.cookies;

	try {
		const decode = jwt.verify(token, process.env.JWT_SECRET);
		req.supplier = await Supplier.findById(decode.id);

		if (!req.supplier) {
			res.cookie("token", null, {
				expires: new Date(Date.now()),
				httpOnly: true,
			});
			return next();
		}

		return next(new ErrorHandler("You have already logged in", 400));
	} catch (e) {
		res.cookie("token", null, {
			expires: new Date(Date.now()),
			httpOnly: true,
		});
		return next();
	}
});

exports.userOrSupplier = catchAsyncErrors(async (req, res, next) => {
	if (req.headers.authorization?.startsWith("Bearer")) {
		return protect(req, res, next);
	} else if (req.cookies.token) {
		return exports.isAuthenticatedUser(req, res, next);
	} else {
		return next(new ErrorHandler("Authenticated as user or supplier", 401));
	}
});
