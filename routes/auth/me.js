const { getSql } = require("../../lib/db");
const { userFromRequest, json, errorMessage } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    json(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const sql = getSql();
    const user = await userFromRequest(sql, req);
    if (!user) {
      json(res, 401, { ok: false, error: "Not signed in" });
      return;
    }
    json(res, 200, { ok: true, user });
  } catch (err) {
    json(res, 500, { ok: false, error: errorMessage(err, "Session error") });
  }
};
