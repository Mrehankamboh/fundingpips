const routes = {
  "/api/health": () => require("../routes/health.js"),
  "/api/auth/register": () => require("../routes/auth/register.js"),
  "/api/auth/login": () => require("../routes/auth/login.js"),
  "/api/auth/logout": () => require("../routes/auth/logout.js"),
  "/api/auth/me": () => require("../routes/auth/me.js"),
  "/api/auth/forgot": () => require("../routes/auth/forgot.js"),
  "/api/auth/reset": () => require("../routes/auth/reset.js"),
  "/api/auth/google": () => require("../routes/auth/google.js"),
  "/api/auth/google/callback": () => require("../routes/auth/google-callback.js"),
  "/api/prices": () => require("../routes/prices.js"),
  "/api/challenges": () => require("../routes/challenges.js"),
  "/api/payouts": () => require("../routes/payouts.js"),
  "/api/tickets": () => require("../routes/tickets.js"),
  "/api/admin/users": () => require("../routes/admin/users.js"),
  "/api/admin/tickets": () => require("../routes/admin/tickets.js"),
};

function normalizeApiPath(pathname) {
  const cleaned = String(pathname || "").split("?")[0].replace(/\/+$/, "") || "/";
  return cleaned.startsWith("/api") ? cleaned : `/api${cleaned.startsWith("/") ? "" : "/"}${cleaned}`;
}

function resolveApiPath(req) {
  const host = req.headers.host || "localhost";
  const url = new URL(req.url || "/", `http://${host}`);
  const fromQuery = url.searchParams.get("__path");
  if (fromQuery) return normalizeApiPath(fromQuery.startsWith("/") ? fromQuery : `/${fromQuery}`);

  const candidates = [
    req.headers["x-forwarded-uri"],
    req.headers["x-invoke-path"],
    req.headers["x-vercel-forwarded-path"],
    url.pathname,
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    try {
      const pathOnly = String(raw).startsWith("http")
        ? new URL(String(raw)).pathname
        : String(raw).split("?")[0];
      if (pathOnly.includes("/api")) return normalizeApiPath(pathOnly);
    } catch (_) {
      /* ignore */
    }
  }

  return normalizeApiPath(url.pathname);
}

function getApiHandler(pathname) {
  const key = normalizeApiPath(pathname);
  const factory = routes[key];
  return factory ? factory() : null;
}

module.exports = {
  routes,
  resolveApiPath,
  getApiHandler,
  normalizeApiPath,
};
