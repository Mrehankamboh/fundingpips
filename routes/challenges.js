const { getSql } = require("../lib/db");
const { ensureSchema } = require("../lib/schema");
const { userFromRequest, readJson, json, errorMessage } = require("../lib/auth");
const { sendChallengePurchaseEmail } = require("../lib/mail");
const { planToChallengeName } = require("../lib/catalog");

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
        SELECT id, evaluation_type, account_size, platform, plan, addons, fee, quantity, status, created_at
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
          plan: row.plan ? String(row.plan) : null,
          addons: Array.isArray(row.addons) ? row.addons : [],
          fee: Number(row.fee),
          quantity: Number(row.quantity || 1),
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
      const plan = cleanText(body.plan, 80) || null;
      let accountSize = Number(
        body.accountSize != null
          ? body.accountSize
          : String(body.account_size || "").replace(/[^0-9.]/g, "")
      );
      let fee = Number(body.fee);
      const quantity = Math.min(4, Math.max(1, Number(body.quantity) || 1));
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
      // Portal sends 100 for $100K — normalize to absolute dollars.
      if (accountSize > 0 && accountSize < 1000) accountSize *= 1000;

      const challengeName = planToChallengeName(evaluationType, plan);
      const priced = await sql`
        SELECT price FROM challenge_prices
        WHERE challenge_name = ${challengeName}
          AND account_size = ${accountSize}
        LIMIT 1
      `;
      if (priced[0] && Number.isFinite(Number(priced[0].price))) {
        fee = Number(priced[0].price);
      }
      if (!Number.isFinite(fee) || fee < 0) {
        json(res, 400, { ok: false, error: "Invalid price" });
        return;
      }

      const inserted = await sql`
        INSERT INTO challenges (
          user_id, evaluation_type, account_size, platform, plan, addons, fee, quantity, status
        )
        VALUES (
          ${user.id},
          ${evaluationType},
          ${accountSize},
          ${platform},
          ${plan},
          ${JSON.stringify(addons)}::jsonb,
          ${fee},
          ${quantity},
          'active'
        )
        RETURNING id
      `;

      try {
        await sendChallengePurchaseEmail({
          firstName: user.first_name,
          email: user.email,
          evaluationType,
          accountSize,
          platform,
          fee,
        });
      } catch (mailErr) {
        console.warn("challenge purchase email failed", mailErr.message || mailErr);
      }

      json(res, 201, {
        ok: true,
        id: String(inserted[0].id),
        redirect: "/portal/accounts.html",
        evaluationType,
        accountSize,
        fee,
        quantity,
      });
      return;
    }

    json(res, 405, { ok: false, error: "Method not allowed" });
  } catch (err) {
    json(res, 500, { ok: false, error: errorMessage(err, "Challenge error") });
  }
};
