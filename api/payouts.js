const { getSql } = require("../lib/db");
const { ensureSchema } = require("../lib/schema");
const { userFromRequest, readJson, json, errorMessage } = require("../lib/auth");

module.exports = async function handler(req, res) {
  try {
    const sql = getSql();
    await ensureSchema(sql);
    const user = await userFromRequest(sql, req);
    if (!user) {
      json(res, 401, { ok: false, error: "Sign in to continue" });
      return;
    }

    if (req.method === "GET") {
      const rows = await sql`
        SELECT id, amount, status, created_at
        FROM payouts
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
      `;
      json(res, 200, {
        ok: true,
        payouts: rows.map((row) => ({
          id: String(row.id),
          amount: Number(row.amount),
          status: String(row.status),
          createdAt: row.created_at,
        })),
      });
      return;
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        json(res, 400, { ok: false, error: "Enter a valid amount" });
        return;
      }
      const rows = await sql`
        INSERT INTO payouts (user_id, amount, status)
        VALUES (${user.id}, ${amount}, 'pending')
        RETURNING id, amount, status, created_at
      `;
      json(res, 201, {
        ok: true,
        payout: {
          id: String(rows[0].id),
          amount: Number(rows[0].amount),
          status: String(rows[0].status),
          createdAt: rows[0].created_at,
        },
      });
      return;
    }

    json(res, 405, { ok: false, error: "Method not allowed" });
  } catch (err) {
    json(res, 500, { ok: false, error: errorMessage(err, "Payout error") });
  }
};
