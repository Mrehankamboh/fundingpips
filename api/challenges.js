const { json } = require("../lib/auth");

/** Challenge purchase tables removed — do not use Forge schema. */
module.exports = async function handler(req, res) {
  json(res, 501, {
    ok: false,
    error: "Challenges API not configured. FundingPips catalog will be added separately — not Forge tables.",
  });
};
