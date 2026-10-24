const { getSql } = require("../../lib/db");
const { ensureSchema } = require("../../lib/schema");
const {
  verifyPassword,
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
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      json(res, 400, { ok: false, error: "Email and password required" });
      return;
    }

    const sql = getSql();
    await ensureSchema(sql);
    const rows = await sql`
      select id, email, password_hash, first_name, last_name, country, role, blocked
      from users
      where lower(email) = ${email}
      limit 1
    `;
    const user = rows[0];
    if (!user || user.blocked) {
      json(res, 401, { ok: false, error: "Invalid email or password" });
      return;
    }
    if (!user.password_hash) {
      json(res, 401, {
        ok: false,
        error: "Password reset required. Use Forgot Password.",
      });
      return;
    }
    if (!verifyPassword(password, user.password_hash)) {
      json(res, 401, { ok: false, error: "Invalid email or password" });
      return;
    }

    const token = await createSession(sql, user.id);
    res.setHeader("Set-Cookie", sessionCookie(token));
    json(res, 200, {
      ok: true,
      redirect: "/portal/dashboard.html",
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        country: user.country,
        role: user.role || "user",
      },
    });
  } catch (err) {
    json(res, 500, { ok: false, error: errorMessage(err, "Login failed") });
  }
};
