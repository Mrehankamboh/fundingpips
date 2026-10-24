const { getSql } = require("../lib/db");
const { ensureSchema, catalogFee } = require("../lib/schema");
const { userFromRequest, readJson, json, errorMessage } = require("../lib/auth");

function cleanText(value, max) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

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
        SELECT id, evaluation_type, account_size, platform, addons, fee, status, created_at
        FROM challenges
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
      `;
      json(res, 200, {
        ok: true,
        challenges: rows.map((row) => ({
          id: String(row.id),
          evaluationType: String(row.evaluation_type),
          accountSize: Number(row.account_size),
          platform: String(row.platform),
          addons: Array.isArray(row.addons) ? row.addons : [],
          fee: Number(row.fee),
          status: String(row.status),
          createdAt: row.created_at,
        })),
      });
      return;
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      const evaluationType = cleanText(body.evaluationType || body.evaluation_type, 120);
      const platform = cleanText(body.platform, 80) || "MetaTrader 5";
      const accountSize = Number(
        body.accountSize != null ? body.accountSize : String(body.account_size || "").replace(/[^0-9.]/g, "")
      );
      const clientFee = Number(body.fee);
      const addons = Array.isArray(body.addons)
        ? body.addons.map((item) => cleanText(item, 80)).filter(Boolean).slice(0, 8)
        : [];

      if (!evaluationType) {
        json(res, 400, { ok: false, error: "Select a challenge first" });
        return;
      }
      if (!Number.isFinite(accountSize) || accountSize <= 0) {
        json(res, 400, { ok: false, error: "Select an account size" });
        return;
      }

      const listed = await catalogFee(sql, evaluationType, accountSize);
      const fee =
        listed != null
          ? listed
          : Number.isFinite(clientFee) && clientFee >= 0
            ? clientFee
            : 0;

      const inserted = await sql`
        INSERT INTO challenges (user_id, evaluation_type, account_size, platform, addons, fee, status)
        VALUES (
          ${user.id},
          ${evaluationType},
          ${accountSize},
          ${platform},
          ${JSON.stringify(addons)}::jsonb,
          ${fee},
          'active'
        )
        RETURNING id
      `;

      json(res, 201, {
        ok: true,
        id: String(inserted[0].id),
        redirect: "/portal/accounts.html",
        evaluationType,
        accountSize,
        fee,
      });
      return;
    }

    json(res, 405, { ok: false, error: "Method not allowed" });
  } catch (err) {
    json(res, 500, { ok: false, error: errorMessage(err, "Challenge error") });
  }
};
