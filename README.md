# FundingPips (local mirror)

Static visual clone of [fundingpips.com](https://fundingpips.com).

> Note: The original HTTrack crawl at this folder failed with HTTP 429 (0 site files). This project was rebuilt from live probes (1440×900) plus the prior homepage polish session.

## Run

```bash
npx --yes serve -l 3021 .
```

Open [http://127.0.0.1:3021](http://127.0.0.1:3021).

## Stack

- `index.html` — homepage
- `css/styles.css` — shared layout & branding
- `css/pages.css` — product / platform / legal / blog layouts
- `js/main.js` — nav, pricing (home), FAQ, carousel helpers
- `assets/logo.svg` — logo mark
- `portal/` — separate app-shell mock pages (login, dashboard, tools)

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
