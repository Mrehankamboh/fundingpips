const crypto = require("crypto");
const { getSql } = require("../../lib/db");
const { ensureSchema } = require("../../lib/schema");
const { readJson, json, errorMessage } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const body = await readJson(req);
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      json(res, 400, { ok: false, error: "Please enter a valid email" });
      return;
    }

    const sql = getSql();
    await ensureSchema(sql);
    const rows = await sql`
      SELECT id, first_name, email FROM users WHERE lower(email) = ${email} LIMIT 1
    `;

    // Always ok (don't leak whether email exists)
    if (!rows.length) {
      json(res, 200, { ok: true });
      return;
    }

    const user = rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    await sql`DELETE FROM password_resets WHERE user_id = ${user.id}`;
    await sql`
      INSERT INTO password_resets (token, user_id, expires_at)
      VALUES (${token}, ${user.id}, now() + interval '1 hour')
    `;

    const origin =
      (req.headers["x-forwarded-proto"] && req.headers["x-forwarded-host"]
        ? `${req.headers["x-forwarded-proto"]}://${req.headers["x-forwarded-host"]}`
        : "") ||
      process.env.APP_ORIGIN ||
      "https://fundingpips-xi.vercel.app";
    const resetPath = `/portal/reset-password.html?token=${encodeURIComponent(token)}`;
    const resetUrl = `${origin.replace(/\/$/, "")}${resetPath}`;

    // Email provider optional — return link so flow works without SMTP
    json(res, 200, {
      ok: true,
      resetUrl,
      message: "Password reset link created. Open the link to set a new password.",
    });
  } catch (err) {
    json(res, 500, { ok: false, error: errorMessage(err, "Could not start reset") });
  }
};
