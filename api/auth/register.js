const { getSql } = require("../../lib/db");
const { ensureSchema } = require("../../lib/schema");
const {
  hashPassword,
  createSession,
  sessionCookie,
  readJson,
  json,
  errorMessage,
} = require("../../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  try {
    const body = await readJson(req);
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const passwordConfirmation = String(
      body.password_confirmation || body.passwordConfirmation || ""
    );
    const firstName = String(body.first_name || body.firstName || "").trim();
    const lastName = String(body.last_name || body.lastName || "").trim();

    if (!email || !password || !firstName || !lastName) {
      json(res, 400, { ok: false, error: "Missing required fields" });
      return;
    }
    if (password.length < 8) {
      json(res, 400, { ok: false, error: "Password must be at least 8 characters" });
      return;
    }
    if (passwordConfirmation && password !== passwordConfirmation) {
      json(res, 400, { ok: false, error: "Passwords do not match" });
      return;
    }

    const sql = getSql();
    await ensureSchema(sql);

    const existing = await sql`select id from users where lower(email) = ${email} limit 1`;
    if (existing.length) {
      json(res, 409, { ok: false, error: "Email already registered" });
      return;
    }

    const passwordHash = hashPassword(password);
    const title = body.title ? String(body.title) : null;
    const dob = body.date_of_birth || body.dateOfBirth || null;
    const country = body.country ? String(body.country) : null;
    const phoneCountry = body.phone_country || body.phoneCountry || null;
    const phoneNumber = body.phone_number || body.phoneNumber || null;
    const referrer = body.referrer_code || body.referrerCode || null;
    const marketing = !!(body.marketing_consent || body.marketingConsent);

    const rows = await sql`
      insert into users (
        email, password_hash, first_name, last_name, title, date_of_birth,
        country, phone_country, phone_number, referrer_code, marketing_consent
      ) values (
        ${email}, ${passwordHash}, ${firstName}, ${lastName}, ${title},
        ${dob}, ${country}, ${phoneCountry}, ${phoneNumber}, ${referrer}, ${marketing}
      )
      returning id, email, first_name, last_name, country, role
    `;

    const user = rows[0];
    const token = await createSession(sql, user.id);
    res.setHeader("Set-Cookie", sessionCookie(token));
    json(res, 201, {
      ok: true,
      redirect: "/portal/dashboard.html",
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        country: user.country,
        role: user.role || "user",
      },
    });
  } catch (err) {
    json(res, 500, { ok: false, error: errorMessage(err, "Registration failed") });
  }
};
