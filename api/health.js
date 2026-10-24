const { getSql } = require("../lib/db");
const { ensureSchema } = require("../lib/schema");
const { json } = require("../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    json(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }
  try {
    const sql = getSql();
    await ensureSchema(sql);
    const rows = await sql`select now() as now`;
    json(res, 200, { ok: true, db: true, schema: true, now: rows[0]?.now || null });
  } catch (err) {
    json(res, 500, { ok: false, db: false, error: err.message || "Database error" });
  }
};
