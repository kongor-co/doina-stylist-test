# Doina Stratulescu website

A static, multilingual portfolio for Doina Stratulescu. It builds without external packages and is ready for GitHub Pages.

## Local preview

Use Node.js 24 or later.

```text
node scripts/build.mjs
node scripts/check.mjs
node scripts/serve.mjs
```

Open `http://127.0.0.1:4173/doina-stylist-test/`.

## Content sources and placeholders

- `locales/en.json`, `de.json`, `ru.json` and `ro.json`: interface copy, biography and PJ item descriptions.
- `content/services.json`: the seven services from the services catalogue, including descriptions, inclusions and prices in four languages.
- `content/pj.json`: product data, prices, image paths and availability.
- `content/media.json`: gallery items and video links.
- `content/contact.json`: email and official social profile URLs.
- `assets/images/`: the supplied portrait and PJ campaign photos, plus a temporary wardrobe image. The source portrait is high resolution.
- `public/logo.png`: the supplied Doina S. signature used in the header, footer and favicon.

The site labels temporary content in the footer. It does not include invented legal wording. Privacy and imprint pages contain a short holding message until approved information is supplied.

## Publish

The repository includes generated pages at its root for the current GitHub Pages source: **Deploy from a branch**, with `main` and `/(root)` selected. Run `npm run publish:root` after editing site content, then commit and push the generated files. The GitHub Actions workflow checks that the published pages match the source. GitHub Pages deploys the branch.

The build uses the repository's Pages address for canonical URLs, social metadata and the sitemap. For a custom domain, set `SITE_URL` to the final full URL before building and configure the domain in GitHub Pages settings.

No booking, checkout or account functions are included in this release.
