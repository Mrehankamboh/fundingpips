# FundingPips (local mirror)

Static visual clone of [fundingpips.com](https://fundingpips.com).

> Note: The original HTTrack crawl at this folder failed with HTTP 429 (0 site files). This project was rebuilt from live probes (1440×900) plus the prior homepage polish session.

## Run

Marketing-only static preview:

```bash
npx --yes serve -l 3021 .
```

Backend (Neon + auth API) needs Vercel dev so `/api/*` works:

```bash
cp .env.example .env.local   # then fill DATABASE_URL + SESSION_SECRET
npm install
npx vercel dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) (or the port `vercel dev` prints).

## Backend (Neon)

- Neon project: `fundingpips` (`icy-poetry-86564381`, aws-us-east-2)
- Table: `users` (register / login)
- API:
  - `GET /api/health` — DB ping
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- Env: `DATABASE_URL`, `SESSION_SECRET` (local `.env.local`, also on Vercel)

## Stack

- `index.html` — homepage
- `css/styles.css` — shared layout & branding
- `css/pages.css` — product / platform / legal / blog layouts
- `js/main.js` — nav, pricing (home), FAQ, carousel helpers
- `assets/logo.svg` — logo mark
- `portal/` — app shell (login/register hit Neon APIs)
- `api/` — Vercel serverless auth + health
- `lib/` — Neon client + session helpers

## Marketing pages

| Path | File |
|------|------|
| `/` | `index.html` |
| `/2-step-standard/` | `2-step-standard/index.html` |
| `/2-step-pro/` | `2-step-pro/index.html` |
| `/2-step-flex/` | `2-step-flex/index.html` |
| `/1-step-flex/` | `1-step-flex/index.html` |
| `/zero/` | `zero/index.html` |
| `/free-trial/` | `free-trial/index.html` |
| `/prime/` | `prime/index.html` |
| `/rewards/` | `rewards/index.html` |
| `/trading-objectives/` | `trading-objectives/index.html` |
| `/tradin/` | `tradin/index.html` |
| `/labs/` | `labs/index.html` |
| `/terms-and-conditions/` | `terms-and-conditions/index.html` |
| `/privacy-policy/` | `privacy-policy/index.html` |
| `/prime-terms-and-conditions/` | `prime-terms-and-conditions/index.html` |
| `/blog/` | `blog/index.html` (listing shell) |

Examples after `serve`:

- [http://127.0.0.1:3021/2-step-standard/](http://127.0.0.1:3021/2-step-standard/)
- [http://127.0.0.1:3021/prime/](http://127.0.0.1:3021/prime/)
- [http://127.0.0.1:3021/blog/](http://127.0.0.1:3021/blog/)
