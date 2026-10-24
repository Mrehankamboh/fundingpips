const { clearSessionCookie, json } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }
  res.setHeader("Set-Cookie", clearSessionCookie());
  json(res, 200, { ok: true });
};
