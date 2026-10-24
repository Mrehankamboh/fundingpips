const { getSql } = require("../lib/db");
const { ensureSchema, DEFAULT_PRICES } = require("../lib/schema");
const { json, errorMessage } = require("../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    json(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }
  try {
    const sql = getSql();
    await ensureSchema(sql);
    const rows = await sql`
      SELECT challenge_key, challenge_name, account_size, price, leverage
      FROM challenge_prices
      ORDER BY challenge_name, account_size
    `;

    const map = new Map();
    for (const row of rows) {
      const key = String(row.challenge_key);
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: String(row.challenge_name),
          balances: [],
        });
      }
      map.get(key).balances.push({
        size: Number(row.account_size),
        price: Number(row.price),
        leverage: String(row.leverage || "1:100"),
      });
    }

    const challenges = map.size ? Array.from(map.values()) : DEFAULT_PRICES;
    json(res, 200, { ok: true, challenges });
  } catch (err) {
    json(res, 500, { ok: false, error: errorMessage(err, "Prices unavailable"), challenges: DEFAULT_PRICES });
  }
};
