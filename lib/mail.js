const nodemailer = require("nodemailer");

const SITE_NAME = "FundingPips";

function gmailUser() {
  return String(process.env.GMAIL_USER || "").trim();
}

function gmailPass() {
  return String(process.env.GMAIL_APP_PASSWORD || "").replace(/\s/g, "");
}

function hasMailer() {
  return Boolean(gmailUser() && gmailPass());
}

function siteOrigin() {
  return String(
    process.env.APP_ORIGIN ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://fundingpips-xi.vercel.app"
  ).replace(/\/$/, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function transporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser(),
      pass: gmailPass(),
    },
  });
}

function shellHtml(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,Arial,Helvetica,sans-serif;color:#08090a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e6e8ee;border-radius:12px;">
            <tr>
              <td style="padding:32px 28px;">
                <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#00225a;font-weight:700;">${SITE_NAME}</p>
                <h1 style="margin:14px 0 0;font-size:24px;line-height:1.3;font-weight:700;color:#08090a;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendWelcomeEmail(input) {
  if (!hasMailer()) {
    console.warn("Gmail is not configured; skipped welcome email.");
    return { sent: false, skipped: true };
  }

  const firstName = String(input.firstName || "").trim() || "trader";
  const origin = siteOrigin();
  const login = `${origin}/portal/login.html`;
  const safeName = escapeHtml(firstName);

  await transporter().sendMail({
    from: `"${SITE_NAME}" <${gmailUser()}>`,
    to: input.email,
    subject: `Welcome to ${SITE_NAME}`,
    text: [
      `Hi ${firstName},`,
      "",
      `Your ${SITE_NAME} account is ready.`,
      `Sign in here: ${login}`,
      "",
      "Use the email and password you just created.",
    ].join("\n"),
    html: shellHtml(
      `Welcome, ${safeName}.`,
      `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#3c465c;">Your account is ready. Sign in with the email and password you just created.</p>
       <p style="margin:24px 0 0;"><a href="${login}" style="display:inline-block;background:#00225a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:12px 22px;border-radius:8px;">Sign in</a></p>`
    ),
  });

  return { sent: true, skipped: false };
}

async function sendPasswordResetEmail(input) {
  if (!hasMailer()) {
    throw new Error("Email is not configured (GMAIL_USER / GMAIL_APP_PASSWORD)");
  }

  const firstName = String(input.firstName || "").trim() || "trader";
  const origin = siteOrigin();
  const reset = `${origin}/portal/reset-password.html?token=${encodeURIComponent(input.token)}`;
  const safeName = escapeHtml(firstName);

  await transporter().sendMail({
    from: `"${SITE_NAME}" <${gmailUser()}>`,
    to: input.email,
    subject: `Reset your ${SITE_NAME} password`,
    text: [
      `Hi ${firstName},`,
      "",
      "We received a request to reset your password.",
      `Choose a new one here: ${reset}`,
      "",
      "This link expires in one hour.",
    ].join("\n"),
    html: shellHtml(
      `Reset your password, ${safeName}.`,
      `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#3c465c;">Choose a new password with the button below. This link expires in one hour.</p>
       <p style="margin:24px 0 0;"><a href="${reset}" style="display:inline-block;background:#00225a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:12px 22px;border-radius:8px;">Choose a new password</a></p>`
    ),
  });

  return { sent: true };
}

async function sendChallengePurchaseEmail(input) {
  if (!hasMailer()) {
    return { sent: false, skipped: true };
  }
  const firstName = String(input.firstName || "").trim() || "trader";
  const origin = siteOrigin();
  const accounts = `${origin}/portal/accounts.html`;
  const safeName = escapeHtml(firstName);
  const summary = `${input.evaluationType} · $${Number(input.accountSize).toLocaleString()} · ${input.platform} · $${Number(input.fee).toFixed(2)}`;

  await transporter().sendMail({
    from: `"${SITE_NAME}" <${gmailUser()}>`,
    to: input.email,
    subject: `Challenge purchased — ${SITE_NAME}`,
    text: [
      `Hi ${firstName},`,
      "",
      "Your challenge purchase is saved.",
      summary,
      "",
      `View accounts: ${accounts}`,
    ].join("\n"),
    html: shellHtml(
      `Thanks, ${safeName}.`,
      `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#3c465c;">Your challenge is saved: <strong>${escapeHtml(summary)}</strong></p>
       <p style="margin:24px 0 0;"><a href="${accounts}" style="display:inline-block;background:#00225a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:12px 22px;border-radius:8px;">View accounts</a></p>`
    ),
  });

  return { sent: true, skipped: false };
}

module.exports = {
  hasMailer,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendChallengePurchaseEmail,
};
