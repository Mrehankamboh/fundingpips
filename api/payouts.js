const { json } = require("../lib/auth");

module.exports = async function handler(req, res) {
  json(res, 501, {
    ok: false,
    error: "Payouts API not configured for FundingPips yet.",
  });
};
