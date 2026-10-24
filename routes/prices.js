const { getSql } = require("../lib/db");
const { ensureSchema } = require("../lib/schema");
const { catalogFromRows, portalFromRows } = require("../lib/catalog");
const { json, errorMessage } = require("../lib/auth");

/** Public catalog — used by homepage + portal; admin edits Neon challenge_prices. */
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    json(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }
  try {
    const sql = getSql();
    await ensureSchema(sql);
    const rows = await sql`
      SELECT challenge_name, account_size, price, leverage
      FROM challenge_prices
      ORDER BY challenge_name, account_size
    `;
    json(res, 200, {
      ok: true,
      catalog: catalogFromRows(rows),
      portal: portalFromRows(rows),
      prices: rows.map((row) => ({
        name: String(row.challenge_name),
        size: Number(row.account_size),
        price: Number(row.price),
        leverage: String(row.leverage || "1:100"),
      })),
    });
  } catch (err) {
    json(res, 500, { ok: false, error: errorMessage(err, "Prices failed") });
  }
};
