const { getSql } = require("../../lib/db");
const {
  verifyPassword,
  signSession,
  sessionCookie,
  readJson,
  json,
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
    const rows = await sql`
      select id, email, password_hash, first_name, last_name, country
      from users
      where lower(email) = ${email}
      limit 1
    `;
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      json(res, 401, { ok: false, error: "Invalid email or password" });
      return;
    }

    const token = signSession(user.id);
    res.setHeader("Set-Cookie", sessionCookie(token));
    json(res, 200, {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        country: user.country,
      },
    });
  } catch (err) {
    json(res, 500, { ok: false, error: err.message || "Login failed" });
  }
};
