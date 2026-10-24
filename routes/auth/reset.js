const { getSql } = require("../../lib/db");
const { ensureSchema } = require("../../lib/schema");
const {
  hashPassword,
  createSession,
  sessionCookie,
  readJson,
  json,
  errorMessage,
} = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const body = await readJson(req);
    const token = String(body.token || "").trim();
    const password = String(body.password || "");
    const passwordConfirmation = String(
      body.password_confirmation || body.passwordConfirmation || ""
    );

    if (!token) {
      json(res, 400, { ok: false, error: "Reset token missing" });
      return;
    }
    if (password.length < 8) {
      json(res, 400, { ok: false, error: "Password must be at least 8 characters" });
      return;
    }
    if (passwordConfirmation && password !== passwordConfirmation) {
      json(res, 400, { ok: false, error: "Passwords do not match" });
      return;
    }

    const sql = getSql();
    await ensureSchema(sql);
    const rows = await sql`
      SELECT user_id FROM password_resets
      WHERE token = ${token} AND expires_at > now()
      LIMIT 1
    `;
    if (!rows.length) {
      json(res, 400, { ok: false, error: "Reset link is invalid or expired" });
      return;
    }

    const userId = rows[0].user_id;
    const passwordHash = hashPassword(password);
    await sql`UPDATE users SET password_hash = ${passwordHash}, updated_at = now() WHERE id = ${userId}`;
    await sql`DELETE FROM password_resets WHERE user_id = ${userId}`;
    await sql`DELETE FROM sessions WHERE user_id = ${userId}`;

    const session = await createSession(sql, userId);
    res.setHeader("Set-Cookie", sessionCookie(session));
    json(res, 200, {
      ok: true,
      message: "Your password was updated. Sign in with your new password.",
      redirect: "/portal/login.html?reset=1",
    });
  } catch (err) {
    json(res, 500, { ok: false, error: errorMessage(err, "Reset failed") });
  }
};
