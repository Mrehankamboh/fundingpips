const { getSql } = require("../../lib/db");
const { ensureSchema } = require("../../lib/schema");
const { userFromRequest, json, errorMessage } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    json(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }
  try {
    const sql = getSql();
    await ensureSchema(sql);
    const me = await userFromRequest(sql, req);
    if (!me || me.role !== "admin") {
      json(res, 403, { ok: false, error: "Admin only" });
      return;
    }

    const rows = await sql`
      SELECT
        u.id, u.email, u.first_name, u.last_name, u.country, u.role, u.blocked, u.created_at,
        (SELECT count(*)::int FROM challenges c WHERE c.user_id = u.id) AS challenge_count,
        (SELECT coalesce(sum(c.fee * c.quantity), 0) FROM challenges c WHERE c.user_id = u.id) AS spent
      FROM users u
      ORDER BY u.created_at DESC
      LIMIT 500
    `;

    json(res, 200, {
      ok: true,
      users: rows.map((row) => ({
        id: String(row.id),
        email: String(row.email),
        first_name: String(row.first_name || ""),
        last_name: String(row.last_name || ""),
        country: row.country,
        role: String(row.role || "user"),
        blocked: !!row.blocked,
        created_at: row.created_at,
        challenge_count: Number(row.challenge_count || 0),
        spent: Number(row.spent || 0),
      })),
    });
  } catch (err) {
    json(res, 500, { ok: false, error: errorMessage(err, "Admin users failed") });
  }
};
