const { getSql } = require("../../lib/db");
const { COOKIE, verifySession, parseCookies, json } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    json(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const cookies = parseCookies(req);
    const uid = verifySession(cookies[COOKIE]);
    if (!uid) {
      json(res, 401, { ok: false, error: "Not signed in" });
      return;
    }

    const sql = getSql();
    const rows = await sql`
      select id, email, first_name, last_name, country, created_at
      from users
      where id = ${uid}::uuid
      limit 1
    `;
    if (!rows.length) {
      json(res, 401, { ok: false, error: "Not signed in" });
      return;
    }

    json(res, 200, { ok: true, user: rows[0] });
  } catch (err) {
    json(res, 500, { ok: false, error: err.message || "Session error" });
  }
};
