/**
 * Local server: static site + /api serverless handlers.
 * Use instead of `npx serve` so register/login work on localhost.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3021);

function loadEnvFile(file) {
  try {
    const text = fs.readFileSync(path.join(ROOT, file), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (_) {
    /* optional */
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const apiRoutes = {
  "/api/health": () => require("./api/health.js"),
  "/api/auth/register": () => require("./api/auth/register.js"),
  "/api/auth/login": () => require("./api/auth/login.js"),
  "/api/auth/logout": () => require("./api/auth/logout.js"),
  "/api/auth/me": () => require("./api/auth/me.js"),
  "/api/auth/forgot": () => require("./api/auth/forgot.js"),
  "/api/auth/reset": () => require("./api/auth/reset.js"),
  "/api/auth/google": () => require("./api/auth/google.js"),
  "/api/auth/google/callback": () => require("./api/auth/google/callback.js"),
  "/api/prices": () => require("./api/prices.js"),
  "/api/challenges": () => require("./api/challenges.js"),
  "/api/payouts": () => require("./api/payouts.js"),
  "/api/admin/users": () => require("./api/admin/users.js"),
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent(reqPath.split("?")[0]);
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(root, cleaned);
  if (!full.startsWith(root)) return null;
  return full;
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    res.end(data);
  });
}

function runApi(handler, req, res) {
  Promise.resolve()
    .then(() => handler(req, res))
    .catch((err) => {
      if (res.headersSent) return;
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, error: err.message || "Server error" }));
    });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  const apiPath = pathname.startsWith("/api/")
    ? pathname
    : pathname === "/api"
      ? "/api"
      : null;

  if (apiPath && apiRoutes[apiPath]) {
    const handler = apiRoutes[apiPath]();
    runApi(handler, req, res);
    return;
  }
  if (pathname.startsWith("/api/")) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: "API route not found" }));
    return;
  }

  let filePath = safeJoin(ROOT, pathname === "/" ? "/index.html" : pathname);
  if (!filePath) {
    res.statusCode = 400;
    res.end("Bad path");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    if (!err || pathname.endsWith(".html")) {
      return sendFile(res, filePath);
    }
    // pretty paths: /portal/login → portal/login.html
    const htmlPath = filePath + ".html";
    fs.stat(htmlPath, (err2) => {
      if (!err2) return sendFile(res, htmlPath);
      sendFile(res, filePath);
    });
  });
});

server.listen(PORT, () => {
  console.log(`FundingPips local (static + API) → http://127.0.0.1:${PORT}`);
  console.log(`Register: http://127.0.0.1:${PORT}/portal/register.html`);
  if (!process.env.DATABASE_URL) {
    console.warn("WARNING: DATABASE_URL missing — copy .env.example to .env.local");
  }
});
