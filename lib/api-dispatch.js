const { getApiHandler, normalizeApiPath } = require("./api-routes");

function pathFromReq(req) {
  const host = req.headers.host || "localhost";
  const url = new URL(req.url || "/", `http://${host}`);

  const fromQuery = url.searchParams.get("__path");
  if (fromQuery) return normalizeApiPath(fromQuery);

  const slug = req.query && req.query.path;
  if (slug != null) {
    const parts = Array.isArray(slug) ? slug : [slug];
    return normalizeApiPath(`/api/${parts.filter(Boolean).join("/")}`);
  }

  if (url.pathname.startsWith("/api/") || url.pathname === "/api") {
    return normalizeApiPath(url.pathname);
  }
  return normalizeApiPath(`/api${url.pathname}`);
}

async function dispatchApi(req, res) {
  const pathname = pathFromReq(req);
  const route = getApiHandler(pathname);
  if (!route) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({ ok: false, error: "API route not found", path: pathname })
    );
    return;
  }
  return route(req, res);
}

module.exports = { dispatchApi, pathFromReq };
