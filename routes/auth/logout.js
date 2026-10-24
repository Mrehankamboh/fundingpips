const { getSql } = require("../../lib/db");
const {
  COOKIE,
  parseCookies,
  destroySession,
  clearSessionCookie,
  json,
} = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }
  try {
    const sql = getSql();
    const token = parseCookies(req)[COOKIE];
    await destroySession(sql, token);
  } catch (_) {
    /* ignore */
  }
  res.setHeader("Set-Cookie", clearSessionCookie());
  json(res, 200, { ok: true, redirect: "/portal/login.html" });
};
