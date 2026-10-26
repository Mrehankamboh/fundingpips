const { getSql } = require("../lib/db");
const { ensureSchema } = require("../lib/schema");
const { userFromRequest, readJson, json, errorMessage } = require("../lib/auth");

function clean(value, max) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function queryKey(req) {
  try {
    const host = req.headers.host || "localhost";
    const url = new URL(req.url || "/", `http://${host}`);
    return clean(url.searchParams.get("key"), 80);
  } catch (_) {
    return "";
  }
}

function groupTickets(rows) {
  const tickets = [];
  const seen = new Map();
  for (const row of rows) {
    const id = String(row.id);
    if (!seen.has(id)) {
      const ticket = {
        id,
        subject: String(row.subject || "Support request"),
        status: String(row.status || "open"),
        createdAt: row.created_at,
        messages: [],
      };
      seen.set(id, ticket);
      tickets.push(ticket);
    }
    if (row.message_id) {
      seen.get(id).messages.push({
        id: String(row.message_id),
        author: String(row.author),
        body: String(row.body),
        createdAt: row.message_at,
      });
    }
  }
  return tickets;
}

module.exports = async function handler(req, res) {
  try {
    const sql = getSql();
    await ensureSchema(sql);
    const user = await userFromRequest(sql, req);

    if (req.method === "GET") {
      const key = queryKey(req);
      if (!/^[a-zA-Z0-9-]{16,80}$/.test(key)) {
        json(res, 200, { ok: true, tickets: [] });
        return;
      }
      const rows = user
        ? await sql`
            SELECT t.id, t.subject, t.status, t.created_at, t.updated_at,
              m.id AS message_id, m.author, m.body, m.created_at AS message_at
            FROM tickets t
            LEFT JOIN ticket_messages m ON m.ticket_id = t.id
            WHERE t.user_id = ${user.id}
            ORDER BY t.updated_at DESC, m.created_at ASC
          `
        : await sql`
            SELECT t.id, t.subject, t.status, t.created_at, t.updated_at,
              m.id AS message_id, m.author, m.body, m.created_at AS message_at
            FROM tickets t
            LEFT JOIN ticket_messages m ON m.ticket_id = t.id
            WHERE t.visitor_key = ${key} AND t.user_id IS NULL
            ORDER BY t.updated_at DESC, m.created_at ASC
          `;
      json(res, 200, { ok: true, tickets: groupTickets(rows) });
      return;
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      const key = clean(body.key, 80);
      const message = clean(body.message, 4000);
      const subject = clean(body.subject, 120) || "Support request";
      const name = clean(body.name, 80);
      const email = clean(body.email, 120);
      const ticketId = clean(body.ticketId, 40);

      if (!/^[a-zA-Z0-9-]{16,80}$/.test(key) || message.length < 1) {
        json(res, 400, { ok: false, error: "Write a message first." });
        return;
      }

      let visitorName = name;
      let visitorEmail = email;
      if (user) {
        if (!visitorName) {
          visitorName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
        }
        if (!visitorEmail) visitorEmail = String(user.email || "");
      }

      if (/^[0-9a-f-]{36}$/i.test(ticketId)) {
        const existing = user
          ? await sql`
              SELECT id, status FROM tickets
              WHERE id = ${ticketId} AND user_id = ${user.id}
              LIMIT 1
            `
          : await sql`
              SELECT id, status FROM tickets
              WHERE id = ${ticketId} AND visitor_key = ${key} AND user_id IS NULL
              LIMIT 1
            `;
        if (!existing[0]) {
          json(res, 404, { ok: false, error: "Ticket was not found." });
          return;
        }
        if (String(existing[0].status) === "closed") {
          json(res, 400, { ok: false, error: "This ticket is closed." });
          return;
        }
        await sql`
          INSERT INTO ticket_messages (ticket_id, author, body)
          VALUES (${ticketId}, 'user', ${message})
        `;
        await sql`UPDATE tickets SET updated_at = now(), status = 'open' WHERE id = ${ticketId}`;
        json(res, 200, { ok: true, id: ticketId });
        return;
      }

      const created = await sql`
        INSERT INTO tickets (user_id, visitor_key, visitor_name, visitor_email, subject)
        VALUES (${user ? user.id : null}, ${key}, ${visitorName || null}, ${visitorEmail || null}, ${subject})
        RETURNING id
      `;
      const id = String(created[0].id);
      await sql`
        INSERT INTO ticket_messages (ticket_id, author, body)
        VALUES (${id}, 'user', ${message})
      `;
      json(res, 201, { ok: true, id });
      return;
    }

    json(res, 405, { ok: false, error: "Method not allowed" });
  } catch (err) {
    json(res, 500, { ok: false, error: errorMessage(err, "Ticket error") });
  }
};
