# RAIDS Group Homepage

This repository contains a clean, academic-style laboratory homepage inspired by the Stanford REAL Lab page layout.

## Quick Start

1. Open `index.html` in your browser to preview locally.
2. Edit content in `index.html`.
3. Push to GitHub `main` (or `master`) branch.
4. GitHub Pages workflow will deploy automatically.

## What to Customize

- Lab name and subtitle: update header section in `index.html`
- Navigation labels and section order: update `<nav>` block
- Research topics: update cards under `#research`
- Members: update grouped lists under `#people`
- Publications: update entries under `#publications`
- News: update items under `#news`
- Contact info: update `#contact` section

## Style Customization

- Main styles are in `styles/main.css`
- Color variables are at the top of the file:
  - `--accent` (theme color)
  - `--text`, `--muted`
  - `--line`, `--surface`
- Max content width can be adjusted with `--max-width`

## GitHub Pages

This repo includes `.github/workflows/deploy-pages.yml` for automatic Pages deployment.

After first push:

1. Go to your GitHub repository.
2. Open **Settings > Pages**.
3. Ensure **Source** is set to **GitHub Actions**.
4. Wait for the workflow to finish.

Your site URL is typically:

- `https://<your-username>.github.io/<repository-name>/`

## Optional: Custom Domain

If you want a custom domain:

1. Add a `CNAME` file in repo root with your domain.
2. Configure DNS records on your domain provider.
3. Enable HTTPS in GitHub Pages settings.

## Analytics (GoatCounter)

Visitor counts and geographic map are provided by [GoatCounter](https://www.goatcounter.com/) (privacy-friendly, no cookies).

- **All pages (footer):** site visitors, this page, and a Visitor map link.
- **Home page:** a **Visitors** section with the site total and an embedded GoatCounter dashboard iframe (includes the world map), using `https://raidsgroup.goatcounter.com?hideui=1`.

1. Create a free GoatCounter site for your Pages domain (this repo uses `raidsgroup`).
2. Set `GOATCOUNTER_ENDPOINT` in `scripts/analytics.js` (e.g. `https://raidsgroup.goatcounter.com/count`).
3. In GoatCounter site settings, enable all three:
   - **Allow adding visitor counts on your website** (footer / home totals)
   - **Dashboard viewable by** → anyone (public dashboard; required for iframe and map link without login)
   - **Sites that can embed GoatCounter** → add your live site domain (e.g. `xxx.github.io` or your custom domain)
4. Deploy, then confirm footer numbers, home Visitors embed, and dashboard hits.

Without the public dashboard and embed allowlist, the home iframe will show a sign-in page or stay blank.

Local previews (`file://`, `localhost`, `127.0.0.1`) do not send pageviews. The `YOURCODE` placeholder disables both tracking and the footer stats UI.

