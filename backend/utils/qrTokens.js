const crypto = require("crypto");

const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// The payload is HMAC-signed. Without a signature the token is just base64 of
// {sessionId, expires} — anyone could mint one for any session and mark
// attendance without ever scanning a QR code.
const sign = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required to sign QR tokens");
  }
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
};

// Generate QR token
function generateQRCodeToken(sessionId) {
  const expires = Date.now() + TOKEN_EXPIRY_MS;
  const payload = Buffer.from(JSON.stringify({ sessionId, expires })).toString(
    "base64url"
  );
  return `${payload}.${sign(payload)}`;
}

// Validate QR token — returns the sessionId, or null if forged/tampered/expired.
function validateQRCodeToken(token) {
  try {
    const [payload, signature] = String(token).split(".");
    if (!payload || !signature) return null;

    const expected = Buffer.from(sign(payload));
    const provided = Buffer.from(signature);

    // Length is checked first: timingSafeEqual throws when lengths differ.
    if (
      expected.length !== provided.length ||
      !crypto.timingSafeEqual(expected, provided)
    ) {
      return null;
    }

    const { sessionId, expires } = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    if (Date.now() > expires) return null;
    return sessionId;
  } catch {
    return null;
  }
}

module.exports = { generateQRCodeToken, validateQRCodeToken, TOKEN_EXPIRY_MS };
