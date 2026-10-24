const { json } = require("../lib/auth");

/** Prices must come from FundingPips catalog — Forge seed removed. */
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    json(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }
  json(res, 200, {
    ok: true,
    challenges: [],
    message: "No seeded prices. Catalog should match FundingPips live data.",
  });
};
