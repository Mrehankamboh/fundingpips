const { getSql } = require("../../lib/db");
const { ensureSchema } = require("../../lib/schema");
const { userFromRequest, readJson, json, errorMessage } = require("../../lib/auth");

const STATUSES = ["open", "in_progress", "resolved", "closed"];

module.exports = async function handler(req, res) {
  try {
    const sql = getSql();
    await ensureSchema(sql);
    const me = await userFromRequest(sql, req);
    if (!me || me.role !== "admin") {
      json(res, 403, { ok: false, error: "Admin only" });
      return;
    }

    if (req.method === "GET") {
      const host = req.headers.host || "localhost";
      const url = new URL(req.url || "/", `http://${host}`);
      const id = String(url.searchParams.get("id") || "");

      if (/^[0-9a-f-]{36}$/i.test(id)) {
        const messages = await sql`
          SELECT id, author, body, created_at
          FROM ticket_messages
          WHERE ticket_id = ${id}
          ORDER BY created_at ASC
        `;
        json(res, 200, {
          ok: true,
          messages: messages.map((row) => ({
            id: String(row.id),
            author: String(row.author),
            body: String(row.body),
            createdAt: row.created_at,
          })),
        });
        return;
      }

      const tickets = await sql`
        SELECT t.id, t.subject, t.status, t.visitor_name, t.visitor_email, t.created_at, t.updated_at,
          coalesce(trim(both from coalesce(u.first_name, '') || ' ' || coalesce(u.last_name, '')), '') AS account_name,
          coalesce(u.email, t.visitor_email, '') AS account_email,
          (SELECT body FROM ticket_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
          (SELECT author FROM ticket_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) AS last_author
        FROM tickets t
        LEFT JOIN users u ON u.id = t.user_id
        ORDER BY t.updated_at DESC
        LIMIT 200
      `;
      json(res, 200, {
        ok: true,
        tickets: tickets.map((row) => ({
          id: String(row.id),
          subject: String(row.subject || "Support request"),
          status: String(row.status || "open"),
          name: String(row.account_name || row.visitor_name || "Visitor").trim() || "Visitor",
          email: String(row.account_email || row.visitor_email || ""),
          lastMessage: String(row.last_message || ""),
          lastAuthor: String(row.last_author || ""),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
      });
      return;
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      const id = String(body.id || "");
      const message = String(body.message || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 4000);
      const status = STATUSES.includes(String(body.status)) ? String(body.status) : "";
      const action = String(body.action || "");
      const messageId = String(body.messageId || "");

      if (!/^[0-9a-f-]{36}$/i.test(id)) {
        json(res, 400, { ok: false, error: "Choose a ticket." });
        return;
      }
      const ticket = await sql`SELECT id FROM tickets WHERE id = ${id} LIMIT 1`;
      if (!ticket[0]) {
        json(res, 404, { ok: false, error: "Ticket was not found." });
        return;
      }

      if (action === "delete") {
        if (!/^[0-9a-f-]{36}$/i.test(messageId)) {
          json(res, 400, { ok: false, error: "Choose a message." });
          return;
        }
        const removed = await sql`
          DELETE FROM ticket_messages
          WHERE id = ${messageId} AND ticket_id = ${id} AND author = 'admin'
          RETURNING id
        `;
        if (!removed[0]) {
          json(res, 404, { ok: false, error: "That reply could not be removed." });
          return;
        }
        json(res, 200, { ok: true });
        return;
      }

      if (message) {
        await sql`
          INSERT INTO ticket_messages (ticket_id, author, body)
          VALUES (${id}, 'admin', ${message})
        `;
      }
      await sql`
        UPDATE tickets
        SET updated_at = now(),
            status = ${status || "open"}
        WHERE id = ${id}
      `;
      json(res, 200, { ok: true });
      return;
    }

    json(res, 405, { ok: false, error: "Method not allowed" });
  } catch (err) {
    json(res, 500, { ok: false, error: errorMessage(err, "Admin tickets failed") });
  }
};
