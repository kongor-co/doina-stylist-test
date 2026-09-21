# Doina Stratulesscu website

A static, multilingual portfolio for Doina Stratulesscu. It builds without external packages and is ready for GitHub Pages.

## Local preview

Use Node.js 24 or later.

```text
node scripts/build.mjs
node scripts/check.mjs
node scripts/serve.mjs
```

Open `http://127.0.0.1:4173/doina-stylist-test/`.

## Content to replace

- `locales/en.json`, `de.json`, `ru.json` and `ro.json`: all visible copy, including the biography and item descriptions.
- `content/services.json`: service order, categories, prices, duration and location keys.
- `content/pj.json`: product data, prices, image paths and availability.
- `content/media.json`: gallery items and video links.
- `content/contact.json`: email and official social profile URLs.
- `assets/images/`: temporary editorial photography. Replace the anonymous portrait with approved photos of Doina and add distinct product images.
- `public/logo.svg`: temporary monogram. Replace it with the approved logo.

The site labels temporary content in the footer. It does not include invented legal wording. Privacy and imprint pages contain a short holding message until approved information is supplied.

## Publish

Set the repository's GitHub Pages source to **GitHub Actions**. A push to `main` builds, checks and deploys the site. The workflow uses the repository's Pages address for canonical URLs, social metadata and the sitemap. For a custom domain, set `SITE_URL` to the final full URL in the workflow before deployment, then configure the domain in GitHub Pages settings.

No booking, checkout or account functions are included in this release.
