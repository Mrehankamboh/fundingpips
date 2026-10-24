const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { ensureSchema } = require("./schema");

const COOKIE = "fp_session";

function hashPassword(password) {
  return bcrypt.hashSync(String(password), 10);
}

function verifyPassword(password, hash) {
  if (!hash) return false;
  return bcrypt.compareSync(String(password), hash);
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach((part) => {
    const i = part.indexOf("=");
    if (i === -1) return;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

function sessionCookie(token, maxAgeSec = 60 * 60 * 24 * 30) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

function clearSessionCookie() {
  const secure = process.env.VERCEL || process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

async function createSession(sql, userId) {
  await ensureSchema(sql);
  const token = crypto.randomBytes(32).toString("hex");
  await sql`INSERT INTO sessions (token, user_id) VALUES (${token}, ${userId})`;
  return token;
}

async function destroySession(sql, token) {
  if (!token) return;
  await ensureSchema(sql);
  await sql`DELETE FROM sessions WHERE token = ${token}`;
}

async function userFromRequest(sql, req) {
  await ensureSchema(sql);
  const cookies = parseCookies(req);
  const token = cookies[COOKIE];
  if (!token) return null;
  const rows = await sql`
    SELECT u.id, u.email, u.first_name, u.last_name, u.country, u.role, u.blocked, u.created_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row || row.blocked) return null;
  return {
    id: String(row.id),
    email: String(row.email || ""),
    first_name: String(row.first_name || ""),
    last_name: String(row.last_name || ""),
    country: row.country ? String(row.country) : null,
    role: String(row.role || "user") === "admin" ? "admin" : "user",
    created_at: row.created_at,
  };
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === "object") {
      resolve(req.body);
      return;
    }
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

function errorMessage(err, fallback) {
  if (err && typeof err.message === "string" && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return fallback || "Request failed";
}

module.exports = {
  COOKIE,
  hashPassword,
  verifyPassword,
  parseCookies,
  sessionCookie,
  clearSessionCookie,
  createSession,
  destroySession,
  userFromRequest,
  readJson,
  json,
  errorMessage,
};
